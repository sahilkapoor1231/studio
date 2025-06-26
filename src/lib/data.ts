import { User, Lead, Task } from './types';
import { subDays, formatISO } from 'date-fns';

const users: User[] = [
  { id: 'user-1', name: 'Dr. Evelyn Reed', avatarUrl: 'https://placehold.co/100x100/E8E8E8/4F4F4F.png', role: 'Doctor' },
  { id: 'user-2', name: 'Alex Carter', avatarUrl: 'https://placehold.co/100x100/D9E8F5/4F4F4F.png', role: 'Counselor' },
  { id: 'user-3', name: 'Mia Garcia', avatarUrl: 'https://placehold.co/100x100/F5D9E8/4F4F4F.png', role: 'Receptionist' },
  { id: 'user-4', name: 'Sam Taylor', avatarUrl: 'https://placehold.co/100x100/E8F5D9/4F4F4F.png', role: 'Counselor' },
];

const leads: Lead[] = [
  {
    id: 'lead-1',
    name: 'John Doe',
    photoUrl: 'https://placehold.co/100x100/C8E6C9/4F4F4F.png',
    email: 'john.doe@example.com',
    phone: '+1-202-555-0101',
    source: 'Website Form',
    assignedTo: users[1],
    status: 'Qualified',
    stage: 'Consultation Done',
    lastContacted: formatISO(subDays(new Date(), 2)),
    inquiryType: 'IVF Journey',
    tags: ['High Intent', 'Needs Follow-up'],
    history: [
      { id: 'h1', timestamp: formatISO(subDays(new Date(), 3)), user: users[1], action: 'Initial call made.' },
      { id: 'h2', timestamp: formatISO(subDays(new Date(), 2)), user: users[0], action: 'Consultation with Dr. Reed.' },
    ],
    notes: [
      { id: 'n1', timestamp: formatISO(subDays(new Date(), 3)), user: users[1], content: 'Patient is very interested in the IVF package. Mentioned budget constraints.' },
    ],
    documents: [
        { id: 'd1', name: 'Initial Scans.pdf', url: '#', uploadedAt: formatISO(subDays(new Date(), 2)) }
    ],
  },
  {
    id: 'lead-2',
    name: 'Jane Smith',
    photoUrl: 'https://placehold.co/100x100/FFCDD2/4F4F4F.png',
    email: 'jane.smith@example.com',
    phone: '+1-202-555-0102',
    source: 'Facebook Ad',
    assignedTo: users[3],
    status: 'New',
    stage: 'Initial Inquiry',
    lastContacted: formatISO(subDays(new Date(), 1)),
    inquiryType: 'General OPD',
    tags: [],
    history: [{ id: 'h3', timestamp: formatISO(subDays(new Date(), 1)), user: users[3], action: 'Lead captured.' }],
    notes: [],
    documents: [],
  },
  {
    id: 'lead-3',
    name: 'Michael Johnson',
    photoUrl: 'https://placehold.co/100x100/B3E5FC/4F4F4F.png',
    email: 'michael.j@example.com',
    phone: '+1-202-555-0103',
    source: 'Walk-in',
    assignedTo: users[2],
    status: 'Appointment Scheduled',
    stage: 'Initial Inquiry',
    lastContacted: formatISO(subDays(new Date(), 5)),
    inquiryType: 'Surgery Consultation',
    tags: ['High Priority'],
    history: [
      { id: 'h4', timestamp: formatISO(subDays(new Date(), 5)), user: users[2], action: 'Appointment booked for next week.' }
    ],
    notes: [],
    documents: [],
  },
  {
    id: 'lead-4',
    name: 'Emily Davis',
    photoUrl: 'https://placehold.co/100x100/F0F4C3/4F4F4F.png',
    email: 'emily.d@example.com',
    phone: '+1-202-555-0104',
    source: 'WhatsApp',
    assignedTo: users[1],
    status: 'Contacted',
    stage: 'Initial Inquiry',
    lastContacted: formatISO(subDays(new Date(), 1)),
    inquiryType: 'IVF Journey',
    tags: [],
    history: [],
    notes: [],
    documents: [],
  },
  {
    id: 'lead-5',
    name: 'Chris Brown',
    photoUrl: 'https://placehold.co/100x100/D1C4E9/4F4F4F.png',
    email: 'chris.b@example.com',
    phone: '+1-202-555-0105',
    source: 'Website Form',
    assignedTo: users[3],
    status: 'No Go',
    stage: 'Initial Inquiry',
    lastContacted: formatISO(subDays(new Date(), 10)),
    inquiryType: 'General OPD',
    tags: ['Not Interested'],
    history: [{ id: 'h5', timestamp: formatISO(subDays(new Date(), 10)), user: users[3], action: 'Marked as "No Go". Reason: Found another clinic.' }],
    notes: [],
    documents: [],
  },
];

const tasks: Task[] = [
    { id: 'task-1', lead: leads[3], title: "Follow up with Emily Davis", dueDate: formatISO(new Date()), status: 'Pending', type: 'Call'},
    { id: 'task-2', lead: leads[0], title: "Send post-consultation info", dueDate: formatISO(new Date()), status: 'Pending', type: 'Message'},
    { id: 'task-3', lead: leads[2], title: "Appointment with Dr. Reed", dueDate: formatISO(subDays(new Date(), -3)), status: 'Pending', type: 'Appointment'},
    { id: 'task-4', lead: leads[1], title: "Initial contact call", dueDate: formatISO(subDays(new Date(), 1)), status: 'Overdue', type: 'Call'},
];


export const getLeads = async (): Promise<Lead[]> => {
  return new Promise(resolve => setTimeout(() => resolve(leads), 500));
};

export const getLeadById = async (id: string): Promise<Lead | undefined> => {
  return new Promise(resolve => setTimeout(() => resolve(leads.find(lead => lead.id === id)), 300));
};

export const getUsers = async (): Promise<User[]> => {
    return new Promise(resolve => setTimeout(() => resolve(users), 100));
}

export const getTasks = async (): Promise<Task[]> => {
    return new Promise(resolve => setTimeout(() => resolve(tasks), 100));
}
