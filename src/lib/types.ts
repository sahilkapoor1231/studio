export type User = {
  id: string;
  name: string;
  avatarUrl: string;
  role: 'Admin' | 'Counselor' | 'Receptionist' | 'Doctor';
};

export type LeadStatus = 'New' | 'Contacted' | 'Qualified' | 'Appointment Scheduled' | 'No Go' | 'Converted';
export type LeadSource = 'Website Form' | 'Facebook Ad' | 'Walk-in' | 'IVR' | 'WhatsApp';
export type LeadStage = 'Initial Inquiry' | 'Consultation Done' | 'Procedure Booked' | 'Follow-up Required';

export type HistoryItem = {
  id: string;
  timestamp: string;
  user: User;
  action: string;
  details?: string;
};

export type Note = {
  id: string;
  timestamp: string;
  user: User;
  content: string;
}

export type Document = {
  id: string;
  name: string;
  url: string;
  uploadedAt: string;
}

export type CustomFieldType = 'Text' | 'Number' | 'Date';

export type CustomFieldDefinition = {
    id: string;
    label: string;
    type: CustomFieldType;
    required: boolean;
};

export type Lead = {
  id: string;
  name: string;
  photoUrl: string;
  email: string;
  phone: string;
  source: LeadSource;
  assignedTo: User;
  status: LeadStatus;
  stage: LeadStage;
  lastContacted: string;
  inquiryType: 'General OPD' | 'IVF Journey' | 'Surgery Consultation';
  tags: string[];
  history: HistoryItem[];
  notes: Note[];
  documents: Document[];
  // Key is the custom field ID, value is the user-provided value.
  customFields?: Record<string, any>;
};

export type Task = {
  id: string;
  lead: Pick<Lead, 'id' | 'name' | 'photoUrl'>;
  title: string;
  dueDate: string;
  status: 'Pending' | 'Done' | 'Overdue';
  type: 'Call' | 'Message' | 'Appointment';
};
