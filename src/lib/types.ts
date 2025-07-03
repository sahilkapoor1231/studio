export type UserRole = 'Admin' | 'Counselor' | 'Receptionist' | 'Doctor';

export type User = {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  role: UserRole;
};

export type LeadSource = 'Website Form' | 'Facebook Ad' | 'Walk-in' | 'IVR' | 'WhatsApp' | 'Zapier' | 'LinkedIn' | 'Calendly';

export type LeadStage = 'Initial Inquiry' | 'Consultation Done' | 'Procedure Booked' | 'Follow-up Required';

export type Lead = {
  id: string;
  name: string;
  photoUrl: string;
  email: string;
  phone: string;
  source: LeadSource;
  assignedTo: User;
  status: string; // e.g., 'New', 'Contacted', 'Qualified'
  stage: LeadStage;
  lastContacted: string; // ISO date string
  inquiryType: string;
  tags: string[];
  history: HistoryItem[];
  notes: Note[];
  documents: Document[];
  customFields?: Record<string, any>;
  deletedAt?: string; // ISO date string
  deletedBy?: User;
};

export type NewLeadPayload = Omit<Lead, 'id' | 'photoUrl' | 'lastContacted' | 'tags' | 'history' | 'notes' | 'documents' | 'assignedTo'> & {
    assignedToId: string;
};

export type TaskStatus = 'Pending' | 'Done' | 'Overdue';
export type TaskType = 'Call' | 'Message' | 'Appointment';

export type Task = {
    id: string;
    lead: Pick<Lead, 'id' | 'name' | 'photoUrl'>;
    assignedTo: User;
    title: string;
    dueDate: string; // ISO date string
    status: TaskStatus;
    type: TaskType;
    completedAt?: string; // ISO date string
    completedBy?: User;
};

export type Note = {
  id: string;
  timestamp: string; // ISO date string
  user: User;
  content: string;
};

export type HistoryItem = {
  id: string;
  timestamp: string; // ISO date string
  user: User;
  action: string;
};

export type Document = {
    id: string;
    name: string;
    url: string;
    uploadedAt: string; // ISO date string
};

export type CustomFieldType = 'Text' | 'Number' | 'Date' | 'Select';

export type CustomFieldDefinition = {
    id: string;
    label: string;
    type: CustomFieldType;
    required: boolean;
    options?: string[]; // for 'Select' type
    parentId?: string; // for conditional logic
};

export type PipelineStage = {
    id: string;
    name: string;
    // Potentially add order/position later
}

// --- WORKFLOW TYPES ---
export type WorkflowTriggerType = 'LEAD_CREATED' | 'LEAD_STATUS_CHANGED' | 'TASK_CREATED' | 'LEAD_ASSIGNED';

export type WorkflowTrigger = {
    type: WorkflowTriggerType;
    value?: string; // e.g., the specific status for LEAD_STATUS_CHANGED
}

export type WorkflowConditionField = 'source' | 'status' | 'inquiryType' | 'stage';
export type WorkflowConditionOperator = 'EQUALS' | 'NOT_EQUALS';

export type WorkflowCondition = {
    id: string;
    field: WorkflowConditionField;
    operator: WorkflowConditionOperator;
    value: string;
}

export type CreateTaskAction = {
    type: 'CREATE_TASK';
    template: string; // e.g., "Follow up with {{lead.name}}"
}

export type UpdateLeadFieldAction = {
    type: 'UPDATE_LEAD_FIELD';
    field: 'status' | 'assignedToId';
    value: string;
}

export type AddTagAction = {
    type: 'ADD_TAG';
    tag: string;
}

export type AddNoteAction = {
    type: 'ADD_NOTE';
    template: string;
}

export type SendEmailAction = {
    type: 'SEND_EMAIL';
    recipient: string;
    template: string;
}

export type SendWhatsAppAction = {
    type: 'SEND_WHATSAPP';
    recipient: string;
    template: string;
}

export type SendNotificationAction = {
    type: 'SEND_NOTIFICATION',
    minutesBefore: number;
    template: string;
}

export type WorkflowAction = CreateTaskAction | UpdateLeadFieldAction | AddTagAction | AddNoteAction | SendEmailAction | SendWhatsAppAction | SendNotificationAction;

export type WorkflowRule = {
    id: string;
    name: string;
    trigger: WorkflowTrigger;
    conditions: WorkflowCondition[];
    action: WorkflowAction;
    status: 'active' | 'inactive';
}

// --- ROUND ROBIN ASSIGNMENT ---
export type RoundRobinAssignment = {
    userId: string;
    weight: number;
}

export type RoundRobinRule = {
    id: string;
    name: string;
    source: LeadSource;
    conditions: WorkflowCondition[];
    assignments: RoundRobinAssignment[];
    lastAssignedIndex: number;
}

// --- INTEGRATIONS ---
export type IntegrationSetting = {
    userId: string;
    service: 'zapier' | 'email' | 'meta' | 'google-ads' | 'whatsapp' | 'google-analytics' | 'linkedin' | 'calendly' | 'hubspot' | 'smtp' | 'bi-tools' | 'google-calendar' | 'zoho-crm';
    value: string; // Can be a URL, email, API key, etc.
    token?: string; // For secure webhook validation
    details?: Record<string, string>; // For complex settings like SMTP
}
