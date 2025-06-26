'use server'

import type { CustomFieldDefinition } from './types'

// This avoids issues with hot-reloading wiping out our data in development
declare global {
  var customFieldsDb: CustomFieldDefinition[] | undefined;
}

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

if (!global.customFieldsDb) {
  global.customFieldsDb = [...initialCustomFields];
}

let customFieldDefinitions = global.customFieldsDb;


export const getCustomFields = async (): Promise<CustomFieldDefinition[]> => {
  // Ensure we return a copy to avoid direct mutation of the global object
  return new Promise(resolve => setTimeout(() => resolve([...customFieldDefinitions]), 100));
}

export const addCustomField = async (field: Omit<CustomFieldDefinition, 'id'>): Promise<CustomFieldDefinition> => {
  const newField = { ...field, id: `field_${Date.now()}` };
  customFieldDefinitions.push(newField);
  global.customFieldsDb = customFieldDefinitions;
  return new Promise(resolve => setTimeout(() => resolve(newField), 100));
}

export const deleteCustomField = async (fieldId: string): Promise<{ success: boolean }> => {
    const index = customFieldDefinitions.findIndex(f => f.id === fieldId);
    if (index > -1) {
        customFieldDefinitions.splice(index, 1);
        global.customFieldsDb = customFieldDefinitions;
        return new Promise(resolve => setTimeout(() => resolve({ success: true }), 100));
    }
    return new Promise(resolve => setTimeout(() => resolve({ success: false }), 100));
}
