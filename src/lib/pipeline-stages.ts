'use server'

import type { PipelineStage } from './types'

// This avoids issues with hot-reloading wiping out our data in development
declare global {
  var pipelineStagesDb: PipelineStage[] | undefined;
}

const initialStages: PipelineStage[] = [
  { id: 'stage-1', name: 'New' },
  { id: 'stage-2', name: 'Contacted' },
  { id: 'stage-3', name: 'Qualified' },
  { id: 'stage-4', name: 'Appointment Scheduled' },
  { id: 'stage-5', name: 'Converted' },
];


if (!global.pipelineStagesDb) {
  global.pipelineStagesDb = [...initialStages];
}

let pipelineStages = global.pipelineStagesDb;

export const getPipelineStages = async (): Promise<PipelineStage[]> => {
  // Ensure we return a copy to avoid direct mutation of the global object
  return new Promise(resolve => setTimeout(() => resolve([...pipelineStages]), 100));
}

export const addPipelineStage = async (stage: Omit<PipelineStage, 'id'>): Promise<PipelineStage> => {
  const newStage = { ...stage, id: `stage_${Date.now()}` };
  pipelineStages.push(newStage);
  global.pipelineStagesDb = pipelineStages;
  return new Promise(resolve => setTimeout(() => resolve(newStage), 100));
}

export const deletePipelineStage = async (stageId: string): Promise<{ success: boolean }> => {
    const index = pipelineStages.findIndex(s => s.id === stageId);
    if (index > -1) {
        pipelineStages.splice(index, 1);
        global.pipelineStagesDb = pipelineStages;
        return new Promise(resolve => setTimeout(() => resolve({ success: true }), 100));
    }
    return new Promise(resolve => setTimeout(() => resolve({ success: false }), 100));
}
