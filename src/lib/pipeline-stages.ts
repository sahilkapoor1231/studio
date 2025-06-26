'use server'

import type { PipelineStage } from './types'

// In a real app, this would be a database.
const initialStages: PipelineStage[] = [
  { id: 'stage-1', name: 'New' },
  { id: 'stage-2', name: 'Contacted' },
  { id: 'stage-3', name: 'Qualified' },
  { id: 'stage-4', name: 'Appointment Scheduled' },
  { id: 'stage-5', name: 'Converted' },
];

let pipelineStages: PipelineStage[] = [...initialStages];

export const getPipelineStages = async (): Promise<PipelineStage[]> => {
  return new Promise(resolve => setTimeout(() => resolve(pipelineStages), 100));
}

export const addPipelineStage = async (stage: Omit<PipelineStage, 'id'>): Promise<PipelineStage> => {
  const newStage = { ...stage, id: `stage_${Date.now()}` };
  pipelineStages.push(newStage);
  return new Promise(resolve => setTimeout(() => resolve(newStage), 100));
}

export const deletePipelineStage = async (stageId: string): Promise<{ success: boolean }> => {
    const index = pipelineStages.findIndex(f => f.id === stageId);
    if (index > -1) {
        pipelineStages.splice(index, 1);
        return new Promise(resolve => setTimeout(() => resolve({ success: true }), 100));
    }
    return new Promise(resolve => setTimeout(() => resolve({ success: false }), 100));
}
