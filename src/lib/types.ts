export type UserRole = 'Admin' | 'Counselor' | 'Receptionist' | 'Doctor';

export type User = {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  role: UserRole;
};

export type PipelineStage = {
    id: string;
    name: string;
}

export type LeadSource = 'Website Form' | 'Facebook Ad' | 'Walk-in' | 'IVR' | 'WhatsApp' | 'Zapier' | 'LinkedIn' | 'Calendly';
export type LeadStage = 'Initial Inquiry' | 'Consultation Done' | 'Procedure Booked' | 'Follow-up Required';

export type HistoryItem = {
  id: string;
  timestamp: string;
  user?: User;
  action: string;
  details?: string;
};

export type Note = {
  id: string;
  timestamp: string;
  user?: User;
  content: string;
}

export type Document = {
  id: string;
  name: string;
  url: string;
  uploadedAt: string;
}

export type CustomFieldType = 'Text' | 'Number' | 'Date' | 'Select';

export type CustomFieldDefinition = {
    id: string;
    label: string;
    type: CustomFieldType;
    required: boolean;
    options?: string[];
    parentId?: string;
};

export type Lead = {
  id:string;
  name: string;
  photoUrl: string;
  email: string;
  phone: string;
  source: LeadSource;
  assignedTo: User;
  status: string; // This now refers to the name of a PipelineStage
  stage: LeadStage;
  lastContacted: string;
  inquiryType: 'General OPD' | 'IVF Journey' | 'Surgery Consultation';
  tags: string[];
  history: HistoryItem[];
  notes: Note[];
  documents: Document[];
  // Key is the custom field ID, value is the user-provided value.
  customFields?: Record<string, any>;
  deletedAt?: string;
  deletedBy?: User;
};

export type Task = {
  id: string;
  lead: Pick<Lead, 'id' | 'name' | 'photoUrl'>;
  assignedTo: User;
  title: string;
  dueDate: string;
  status: 'Pending' | 'Done' | 'Overdue';
  type: 'Call' | 'Message' | 'Appointment';
  completedAt?: string;
  completedBy?: User;
};

export type NewLeadPayload = {
    name: string;
    email: string;
    phone: string;
    source: LeadSource;
    assignedToId: string;
    status: string;
    inquiryType: 'General OPD' | 'IVF Journey' | 'Surgery Consultation';
    stage: LeadStage;
    customFields?: Record<string, any>;
};

// WORKFLOW TYPES
export type WorkflowTriggerType = 'LEAD_STATUS_CHANGED' | 'LEAD_CREATED';

export type CreateTaskAction = {
    type: 'CREATE_TASK';
    template: string;
};

export type UpdateLeadFieldAction = {
    type: 'UPDATE_LEAD_FIELD';
    field: 'status' | 'assignedToId';
    value: string; // Will be a stage name or a user ID
};

export type AddTagAction = {
    type: 'ADD_TAG';
    tag: string;
};

export type AddNoteAction = {
    type: 'ADD_NOTE';
    template: string;
};

export type SendEmailAction = {
    type: 'SEND_EMAIL';
    recipient: string; // Can be an email address or a placeholder like {{lead.email}}
    template: string; // The email body template
};

export type SendWhatsAppAction = {
    type: 'SEND_WHATSAPP';
    recipient: string; // Can be a phone number or a placeholder like {{lead.phone}}
    template: string; // The message template
};

export type WorkflowAction = 
    | CreateTaskAction 
    | UpdateLeadFieldAction 
    | AddTagAction 
    | AddNoteAction
    | SendEmailAction
    | SendWhatsAppAction;

export type WorkflowConditionField = 'source' | 'inquiryType' | 'status' | 'stage';
export type WorkflowConditionOperator = 'EQUALS' | 'NOT_EQUALS';

export type WorkflowCondition = {
  id: string;
  field: WorkflowConditionField;
  operator: WorkflowConditionOperator;
  value: string;
};

export type WorkflowRule = {
    id: string;
    name: string;
    status: 'active' | 'inactive';
    trigger: {
        type: WorkflowTriggerType;
        value?: string; 
    };
    conditions: WorkflowCondition[];
    action: WorkflowAction;
}

// LEAD ASSIGNMENT TYPES
export type RoundRobinAssignment = {
    userId: string;
    weight: number; // Represents the number of leads to assign in a cycle
};

export type RoundRobinRule = {
    id: string;
    name: string;
    source: LeadSource;
    assignments: RoundRobinAssignment[];
    // Index of the last user ID in the expanded assignment queue.
    lastAssignedIndex: number;
};

// INTEGRATION TYPES
export type IntegrationSetting = {
    userId: string;
    service: 'zapier' | 'email' | 'google-ads' | 'whatsapp' | 'meta' | 'google-analytics' | 'linkedin' | 'calendly' | 'hubspot' | 'smtp' | 'bi-tools' | 'google-calendar' | 'zoho-crm';
    value: string; // The webhook URL, email address, API key, or primary value (like SMTP host)
    token?: string; // The secret part of the webhook URL or API key
    details?: Record<string, string>; // For multi-part settings like SMTP
}
