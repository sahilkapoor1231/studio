'use server'

import { User, Lead, Task, Note, NewLeadPayload, CustomFieldDefinition, PipelineStage, WorkflowRule } from './types';
import { subDays, formatISO, addDays } from 'date-fns';
import { summarizeLead } from '@/ai/flows/summarize-lead-flow';

// This avoids issues with hot-reloading wiping out our data in development
declare global {
  var usersDb: User[] | undefined;
  var leadsDb: Lead[] | undefined;
  var tasksDb: Task[] | undefined;
  var customFieldsDb: CustomFieldDefinition[] | undefined;
  var pipelineStagesDb: PipelineStage[] | undefined;
  var workflowsDb: WorkflowRule[] | undefined;
}

// --- INITIAL DATA ---
const initialUsers: User[] = [
  { id: 'user-1', name: 'Dr. Evelyn Reed', avatarUrl: 'https://placehold.co/100x100/E8E8E8/4F4F4F.png', role: 'Doctor' },
  { id: 'user-2', name: 'Alex Carter', avatarUrl: 'https://placehold.co/100x100/D9E8F5/4F4F4F.png', role: 'Counselor' },
  { id: 'user-3', name: 'Mia Garcia', avatarUrl: 'https://placehold.co/100x100/F5D9E8/4F4F4F.png', role: 'Receptionist' },
  { id: 'user-4', name: 'Sam Taylor', avatarUrl: 'https://placehold.co/100x100/E8F5D9/4F4F4F.png', role: 'Counselor' },
  { id: 'user-ai', name: 'AI Assistant', avatarUrl: 'https://placehold.co/100x100/8A2BE2/FFFFFF.png', role: 'Admin'},
];

const initialCustomFields: CustomFieldDefinition[] = [
  { id: 'field_dob', label: 'Date of Birth', type: 'Date', required: false },
  { id: 'field_spouse', label: "Spouse's Name", type: 'Text', required: false },
  { id: 'field_priority', label: 'Priority', type: 'Select', required: true, options: ['High', 'Medium', 'Low'] },
];

const initialStages: PipelineStage[] = [
  { id: 'stage-1', name: 'New' },
  { id: 'stage-2', name: 'Contacted' },
  { id: 'stage-3', name: 'Qualified' },
  { id: 'stage-4', name: 'Appointment Scheduled' },
  { id: 'stage-5', name: 'Converted' },
];

const initialLeads: Lead[] = [
  {
    id: 'lead-1', name: 'John Doe', photoUrl: 'https://placehold.co/100x100/C8E6C9/4F4F4F.png', email: 'john.doe@example.com', phone: '+1-202-555-0101', source: 'Website Form', assignedTo: initialUsers[1], status: 'Qualified', stage: 'Consultation Done', lastContacted: formatISO(subDays(new Date(), 2)), inquiryType: 'IVF Journey', tags: ['High Intent', 'Needs Follow-up'],
    history: [ { id: 'h1', timestamp: formatISO(subDays(new Date(), 3)), user: initialUsers[1], action: 'Initial call made.' }, { id: 'h2', timestamp: formatISO(subDays(new Date(), 2)), user: initialUsers[0], action: 'Consultation with Dr. Reed.' }, ],
    notes: [ { id: 'n1', timestamp: formatISO(subDays(new Date(), 3)), user: initialUsers[1], content: 'Patient is very interested in the IVF package. Mentioned budget constraints.' }, ],
    documents: [ { id: 'd1', name: 'Initial Scans.pdf', url: '#', uploadedAt: formatISO(subDays(new Date(), 2)) } ],
    customFields: { "field_dob": "1985-05-20", "field_spouse": "Jane Doe", "field_priority": "High" }
  },
  { id: 'lead-2', name: 'Jane Smith', photoUrl: 'https://placehold.co/100x100/FFCDD2/4F4F4F.png', email: 'jane.smith@example.com', phone: '+1-202-555-0102', source: 'Facebook Ad', assignedTo: initialUsers[3], status: 'New', stage: 'Initial Inquiry', lastContacted: formatISO(subDays(new Date(), 1)), inquiryType: 'General OPD', tags: [], history: [{ id: 'h3', timestamp: formatISO(subDays(new Date(), 1)), user: initialUsers[3], action: 'Lead captured.' }], notes: [], documents: [], customFields: { "field_priority": "Medium" } },
  { id: 'lead-3', name: 'Michael Johnson', photoUrl: 'https://placehold.co/100x100/B3E5FC/4F4F4F.png', email: 'michael.j@example.com', phone: '+1-202-555-0103', source: 'Walk-in', assignedTo: initialUsers[2], status: 'Appointment Scheduled', stage: 'Initial Inquiry', lastContacted: formatISO(subDays(new Date(), 5)), inquiryType: 'Surgery Consultation', tags: ['High Priority'], history: [ { id: 'h4', timestamp: formatISO(subDays(new Date(), 5)), user: initialUsers[2], action: 'Appointment booked for next week.' } ], notes: [], documents: [], customFields: { "field_priority": "High" } },
  { id: 'lead-4', name: 'Emily Davis', photoUrl: 'https://placehold.co/100x100/F0F4C3/4F4F4F.png', email: 'emily.d@example.com', phone: '+1-202-555-0104', source: 'WhatsApp', assignedTo: initialUsers[1], status: 'Contacted', stage: 'Initial Inquiry', lastContacted: formatISO(subDays(new Date(), 1)), inquiryType: 'IVF Journey', tags: [], history: [], notes: [], documents: [], customFields: { "field_priority": "Low" } },
  { id: 'lead-5', name: 'Chris Brown', photoUrl: 'https://placehold.co/100x100/D1C4E9/4F4F4F.png', email: 'chris.b@example.com', phone: '+1-202-555-0105', source: 'Website Form', assignedTo: initialUsers[3], status: 'Converted', stage: 'Procedure Booked', lastContacted: formatISO(subDays(new Date(), 10)), inquiryType: 'General OPD', tags: [], history: [{ id: 'h5', timestamp: formatISO(subDays(new Date(), 10)), user: initialUsers[3], action: 'Converted to Patient.' }], notes: [], documents: [], customFields: { "field_priority": "Medium" } },
  { id: 'lead-6', name: 'Jessica Williams', photoUrl: 'https://placehold.co/100x100/FFE0B2/4F4F4F.png', email: 'jess.w@example.com', phone: '+1-202-555-0106', source: 'IVR', assignedTo: initialUsers[3], status: 'Converted', stage: 'Procedure Booked', lastContacted: formatISO(subDays(new Date(), 15)), inquiryType: 'IVF Journey', tags: [], history: [], notes: [], documents: [], customFields: { "field_priority": "Low" } },
];

const initialTasks: Task[] = [
    { id: 'task-1', lead: initialLeads[3], title: "Follow up with Emily Davis", dueDate: formatISO(new Date()), status: 'Pending', type: 'Call'},
    { id: 'task-2', lead: initialLeads[0], title: "Send post-consultation info", dueDate: formatISO(new Date()), status: 'Pending', type: 'Message'},
    { id: 'task-3', lead: initialLeads[2], title: "Appointment with Dr. Reed", dueDate: formatISO(addDays(new Date(), 3)), status: 'Pending', type: 'Appointment'},
    { id: 'task-4', lead: initialLeads[1], title: "Initial contact call", dueDate: formatISO(subDays(new Date(), 2)), status: 'Overdue', type: 'Call'},
    { id: 'task-5', lead: initialLeads[0], title: "Discuss financing options", dueDate: formatISO(addDays(new Date(), 1)), status: 'Pending', type: 'Call'},
];

const initialWorkflows: WorkflowRule[] = [
    { id: 'wf-1', name: 'Task on Appointment', trigger: { type: 'LEAD_STATUS_CHANGED', value: 'Appointment Scheduled'}, action: { type: 'CREATE_TASK', template: 'Prepare for {{lead.name}} appointment' } }
]

// --- DATABASE INITIALIZATION ---
// Initialize in-memory DB only if it doesn't exist
if (typeof global.usersDb === 'undefined') {
  global.usersDb = [...initialUsers];
}
if (typeof global.leadsDb === 'undefined') {
  global.leadsDb = [...initialLeads];
}
if (typeof global.tasksDb === 'undefined') {
  global.tasksDb = [...initialTasks];
}
if (typeof global.customFieldsDb === 'undefined') {
  global.customFieldsDb = [...initialCustomFields];
}
if (typeof global.pipelineStagesDb === 'undefined') {
  global.pipelineStagesDb = [...initialStages];
}
if (typeof global.workflowsDb === 'undefined') {
  global.workflowsDb = [...initialWorkflows];
}

const users = global.usersDb;
const leads = global.leadsDb;
const tasks = global.tasksDb;
const customFieldDefinitions = global.customFieldsDb;
const pipelineStages = global.pipelineStagesDb;
const workflows = global.workflowsDb;

// --- MOCK DELAY ---
const mockDelay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// --- LEAD FUNCTIONS ---
export const getLeads = async (): Promise<Lead[]> => {
  await mockDelay(500);
  return [...leads];
};

export const getLeadById = async (id: string): Promise<Lead | undefined> => {
  await mockDelay(300);
  return leads.find(lead => lead.id === id);
};

export const addLead = async (leadData: NewLeadPayload): Promise<Lead> => {
    const assignedUser = users.find(u => u.id === leadData.assignedToId);
    if (!assignedUser) throw new Error("Assigned user not found");
    const aiUser = users.find(u => u.id === 'user-ai');

    const newLead: Lead = {
        id: `lead-${Date.now()}`, name: leadData.name, email: leadData.email, phone: leadData.phone, source: leadData.source, assignedTo: assignedUser, status: leadData.status, inquiryType: leadData.inquiryType, stage: leadData.stage, customFields: leadData.customFields, photoUrl: `https://placehold.co/100x100.png`, lastContacted: new Date().toISOString(), tags: [],
        history: [ { id: `h-${Date.now()}`, timestamp: new Date().toISOString(), user: assignedUser, action: 'Lead created.' } ],
        notes: [], documents: [],
    };

    if (newLead.source === 'Website Form') {
        try {
            const insights = await summarizeLead({ name: newLead.name, inquiryType: newLead.inquiryType, history: newLead.history, notes: newLead.notes, customFields: newLead.customFields });
            const aiNote: Note = { id: `note-ai-${Date.now()}`, timestamp: new Date().toISOString(), user: aiUser, content: `**AI Summary:** ${insights.summary}\n**Temperature:** ${insights.temperature}` };
            newLead.notes.push(aiNote);
            newLead.history.push({ id: `h-ai-${Date.now()}`, timestamp: new Date().toISOString(), user: aiUser, action: 'AI analysis completed.' });
        } catch (e) {
            console.error("AI workflow failed for new lead:", e);
        }
    }
    leads.unshift(newLead);
    await mockDelay(200);
    return newLead;
}


export const updateLeadStatus = async (leadId: string, newStatus: string): Promise<{ success: boolean; workflowTriggered: boolean }> => {
    let workflowTriggered = false;
    const leadIndex = leads.findIndex(l => l.id === leadId);
    if (leadIndex === -1) {
        return { success: false, workflowTriggered };
    }
    
    leads[leadIndex].status = newStatus;
    const lead = leads[leadIndex];

    const matchingWorkflows = workflows.filter(
        w => w.trigger.type === 'LEAD_STATUS_CHANGED' && w.trigger.value === newStatus
    );

    for (const rule of matchingWorkflows) {
        if (rule.action.type === 'CREATE_TASK') {
            const taskTitle = rule.action.template.replace('{{lead.name}}', lead.name);
            await addTask({
                lead: { id: lead.id, name: lead.name, photoUrl: lead.photoUrl },
                title: taskTitle,
                dueDate: formatISO(addDays(new Date(), 1)), // Set due date for next day
                type: 'Appointment', // Default type for this action
            });
            workflowTriggered = true;
        }
    }
    
    await mockDelay(200);
    return { success: true, workflowTriggered };
}

// --- USER FUNCTIONS ---
export const getUsers = async (): Promise<User[]> => {
    await mockDelay(100);
    return [...users];
}

// --- TASK FUNCTIONS ---
export const getTasks = async (): Promise<Task[]> => {
    await mockDelay(100);
    return [...tasks];
}

export const addTask = async (taskData: Omit<Task, 'id' | 'status'>): Promise<Task> => {
    const newTask: Task = { id: `task-${Date.now()}`, status: 'Pending', ...taskData };
    tasks.unshift(newTask);
    await mockDelay(100);
    return newTask;
}

// --- CUSTOM FIELD FUNCTIONS ---
export const getCustomFields = async (): Promise<CustomFieldDefinition[]> => {
  await mockDelay(100);
  return [...customFieldDefinitions];
}

export const addCustomField = async (field: Omit<CustomFieldDefinition, 'id'>): Promise<CustomFieldDefinition> => {
  const newField = { ...field, id: `field_${Date.now()}` };
  customFieldDefinitions.push(newField);
  await mockDelay(100);
  return newField;
}

export const deleteCustomField = async (fieldId: string): Promise<{ success: boolean }> => {
    const index = customFieldDefinitions.findIndex(f => f.id === fieldId);
    if (index > -1) {
        customFieldDefinitions.splice(index, 1);
        await mockDelay(100);
        return { success: true };
    }
    return { success: false };
}

// --- PIPELINE STAGE FUNCTIONS ---
export const getPipelineStages = async (): Promise<PipelineStage[]> => {
  await mockDelay(100);
  return [...pipelineStages];
}

export const addPipelineStage = async (stage: Omit<PipelineStage, 'id'>): Promise<PipelineStage> => {
  const newStage = { ...stage, id: `stage_${Date.now()}` };
  pipelineStages.push(newStage);
  await mockDelay(100);
  return newStage;
}

export const deletePipelineStage = async (stageId: string): Promise<{ success: boolean }> => {
    const index = pipelineStages.findIndex(s => s.id === stageId);
    if (index > -1) {
        pipelineStages.splice(index, 1);
        await mockDelay(100);
        return { success: true };
    }
    return { success: false };
}

// --- WORKFLOW FUNCTIONS ---
export const getWorkflows = async (): Promise<WorkflowRule[]> => {
  await mockDelay(100);
  return [...workflows];
}

export const addWorkflow = async (rule: Omit<WorkflowRule, 'id'>): Promise<WorkflowRule> => {
  const newRule = { ...rule, id: `wf_${Date.now()}` };
  workflows.push(newRule);
  await mockDelay(100);
  return newRule;
}

export const deleteWorkflow = async (ruleId: string): Promise<{ success: boolean }> => {
    const index = workflows.findIndex(r => r.id === ruleId);
    if (index > -1) {
        workflows.splice(index, 1);
        await mockDelay(100);
        return { success: true };
    }
    return { success: false };
}
