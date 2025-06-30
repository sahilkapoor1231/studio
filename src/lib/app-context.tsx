'use client'

import { createContext, useContext, ReactNode } from 'react';
import type { User, PipelineStage, CustomFieldDefinition } from './types';

type AppContextType = {
  allUsers: User[];
  assignableUsers: User[];
  pipelineStages: PipelineStage[];
  customFields: CustomFieldDefinition[];
};

const AppContext = createContext<AppContextType | null>(null);

export function AppContextProvider({ children, value }: { children: ReactNode; value: AppContextType }) {
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppContextProvider');
  }
  return context;
}
