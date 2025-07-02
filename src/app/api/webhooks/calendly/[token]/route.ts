import { NextResponse } from 'next/server';
import { addLead, findUserByIntegrationToken, getLeads, addTask, updateLeadStatus } from '@/lib/data';
import type { NewLeadPayload, LeadStage } from '@/lib/types';
import { formatISO } from 'date-fns';

// This is the endpoint that Calendly will call.
// The [token] is a dynamic route segment that will contain the user's secret token.
export async function POST(
    request: Request,
    { params }: { params: { token: string } }
) {
    const token = params.token;

    if (!token) {
        return NextResponse.json({ message: 'Missing authentication token.' }, { status: 401 });
    }

    try {
        // 1. Authenticate the request using the token
        const user = await findUserByIntegrationToken(token, 'calendly');
        if (!user) {
            return NextResponse.json({ message: 'Invalid authentication token.' }, { status: 403 });
        }

        // 2. Parse the incoming data from Calendly
        const body = await request.json();
        const { event, payload } = body;

        // We only care about new bookings
        if (event !== 'invitee.created') {
            return NextResponse.json({ message: 'Event ignored.' });
        }

        const { name, email, scheduled_event } = payload;
        const phone = payload.questions_and_answers?.find((qa: any) => qa.question.toLowerCase().includes('phone'))?.answer || 'N/A';

        if (!name || !email || !scheduled_event) {
            return NextResponse.json({ message: 'Missing required payload data: name, email, and scheduled_event are required.' }, { status: 400 });
        }

        // 3. Find if lead already exists by email
        const allLeads = await getLeads();
        let lead = allLeads.find(l => l.email.toLowerCase() === email.toLowerCase());

        // 4. If lead does not exist, create a new one
        if (!lead) {
            const leadPayload: NewLeadPayload = {
                name,
                email,
                phone,
                source: 'Calendly',
                assignedToId: user.id, // Assign to the user who owns the webhook
                status: 'New',
                stage: 'Initial Inquiry' as LeadStage,
                inquiryType: 'General OPD',
            };
            lead = await addLead(leadPayload);
        }
        
        if (!lead) {
             return NextResponse.json({ message: 'Failed to find or create a lead.' }, { status: 500 });
        }

        // 5. Create an appointment task for the lead
        await addTask({
            lead: { id: lead.id, name: lead.name, photoUrl: lead.photoUrl },
            assignedTo: user,
            title: `Appointment: ${scheduled_event.name}`,
            dueDate: formatISO(new Date(scheduled_event.start_time)),
            type: 'Appointment',
        });
        
        // 6. Update lead status to 'Appointment Scheduled'
        await updateLeadStatus(lead.id, 'Appointment Scheduled', user.id);

        return NextResponse.json({ success: true, leadId: lead.id });

    } catch (error) {
        console.error('Calendly Webhook Error:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
        return NextResponse.json({ message: `An internal server error occurred: ${errorMessage}` }, { status: 500 });
    }
}
