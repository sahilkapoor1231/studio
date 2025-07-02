import { NextResponse } from 'next/server';
import { addLead, findUserByIntegrationToken } from '@/lib/data';
import type { NewLeadPayload, LeadStage, LeadSource } from '@/lib/types';

// This is the endpoint that Zapier will call.
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
        const user = await findUserByIntegrationToken(token, 'zapier');
        if (!user) {
            return NextResponse.json({ message: 'Invalid authentication token.' }, { status: 403 });
        }

        // 2. Parse the incoming lead data from Zapier
        const body = await request.json();
        const { name, email, phone, inquiryType = 'General OPD', notes } = body;

        if (!name || !email || !phone) {
            return NextResponse.json({ message: 'Missing required fields: name, email, and phone are required.' }, { status: 400 });
        }

        // 3. Prepare the payload to create a new lead
        const leadPayload: NewLeadPayload = {
            name,
            email,
            phone,
            source: 'Zapier', // Hardcode the source
            assignedToId: user.id, // Assign to the user who owns the webhook
            status: 'New', // Leads from integrations always start as 'New'
            stage: 'Initial Inquiry' as LeadStage,
            inquiryType: inquiryType,
            customFields: {
                ...(notes && { "webhook_notes": notes }) // Add any extra data from zapier as a custom field
            }
        };

        // 4. Add the lead to the database
        const newLead = await addLead(leadPayload);

        return NextResponse.json({ success: true, leadId: newLead.id });

    } catch (error) {
        console.error('Zapier Webhook Error:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
        return NextResponse.json({ message: `An internal server error occurred: ${errorMessage}` }, { status: 500 });
    }
}
