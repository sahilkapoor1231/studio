'use server'

import type { CustomFieldDefinition } from './types'

// In a real app, this would be a database.
const initialCustomFields: CustomFieldDefinition[] = [
  {
    id: 'field_dob',
    label: 'Date of Birth',
    type: 'Date',
    required: false,
  },
  {
    id: 'field_spouse',
    label: "Spouse's Name",
    type: 'Text',
    required: false,
  },
];

let customFieldDefinitions: CustomFieldDefinition[] = [...initialCustomFields];

export const getCustomFields = async (): Promise<CustomFieldDefinition[]> => {
  return new Promise(resolve => setTimeout(() => resolve(customFieldDefinitions), 100));
}

export const addCustomField = async (field: Omit<CustomFieldDefinition, 'id'>): Promise<CustomFieldDefinition> => {
  const newField = { ...field, id: `field_${Date.now()}` };
  customFieldDefinitions.push(newField);
  return new Promise(resolve => setTimeout(() => resolve(newField), 100));
}

export const deleteCustomField = async (fieldId: string): Promise<{ success: boolean }> => {
    const index = customFieldDefinitions.findIndex(f => f.id === fieldId);
    if (index > -1) {
        customFieldDefinitions.splice(index, 1);
        return new Promise(resolve => setTimeout(() => resolve({ success: true }), 100));
    }
    return new Promise(resolve => setTimeout(() => resolve({ success: false }), 100));
}
