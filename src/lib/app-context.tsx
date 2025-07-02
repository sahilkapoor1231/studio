'use client'

import { createContext, useContext, ReactNode, useState, useCallback } from 'react';
import type { User, PipelineStage, CustomFieldDefinition, RoundRobinRule, WorkflowRule, Task, Lead } from './types';

type AppContextType = {
  // Data
  allUsers: User[];
  assignableUsers: User[];
  pipelineStages: PipelineStage[];
  customFields: CustomFieldDefinition[];
  roundRobinRules: RoundRobinRule[];
  workflows: WorkflowRule[];
  tasks: Task[];
  allLeads: Lead[];

  // Updaters
  addCustomField: (field: CustomFieldDefinition) => void;
  deleteCustomField: (fieldId: string) => void;
  addPipelineStage: (stage: PipelineStage) => void;
  deletePipelineStage: (stageId: string) => void;
  addWorkflow: (workflow: WorkflowRule) => void;
  deleteWorkflow: (workflowId: string) => void;
  updateWorkflow: (workflow: WorkflowRule) => void;
  addUser: (user: User) => void;
  updateUser: (user: User) => void;
  deleteUser: (userId: string) => void;
  addRoundRobinRule: (rule: RoundRobinRule) => void;
  deleteRoundRobinRule: (ruleId: string) => void;
  addTask: (task: Task) => void;
  updateTask: (task: Task) => void;
};

const AppContext = createContext<AppContextType | null>(null);

type InitialData = {
    allUsers: User[];
    assignableUsers: User[];
    pipelineStages: PipelineStage[];
    customFields: CustomFieldDefinition[];
    roundRobinRules: RoundRobinRule[];
    workflows: WorkflowRule[];
    tasks: Task[];
    allLeads: Lead[];
}

export function AppContextProvider({ children, initialData }: { children: ReactNode; initialData: InitialData }) {
    const [allUsers, setAllUsers] = useState<User[]>(initialData.allUsers);
    const [pipelineStages, setPipelineStages] = useState<PipelineStage[]>(initialData.pipelineStages);
    const [customFields, setCustomFields] = useState<CustomFieldDefinition[]>(initialData.customFields);
    const [roundRobinRules, setRoundRobinRules] = useState<RoundRobinRule[]>(initialData.roundRobinRules);
    const [workflows, setWorkflows] = useState<WorkflowRule[]>(initialData.workflows);
    const [tasks, setTasks] = useState<Task[]>(initialData.tasks);
    const [allLeads, setAllLeads] = useState<Lead[]>(initialData.allLeads);

    const assignableUsers = allUsers.filter(u => u.role === 'Counselor' || u.role === 'Receptionist');

    const handleAddCustomField = useCallback((field: CustomFieldDefinition) => {
        setCustomFields(prev => [...prev, field]);
    }, []);
    
    const handleDeleteCustomField = useCallback((fieldId: string) => {
        setCustomFields(prevFields => {
            const fieldsToDelete = new Set<string>();
            const queue: string[] = [fieldId];
            fieldsToDelete.add(fieldId);

            while (queue.length > 0) {
                const currentId = queue.shift()!;
                const children = prevFields.filter(f => f.parentId === currentId);
                for (const child of children) {
                    if (!fieldsToDelete.has(child.id)) {
                        fieldsToDelete.add(child.id);
                        queue.push(child.id);
                    }
                }
            }
            return prevFields.filter(f => !fieldsToDelete.has(f.id));
        });
    }, []);

    const handleAddPipelineStage = useCallback((stage: PipelineStage) => {
        setPipelineStages(prev => [...prev, stage]);
    }, []);

    const handleDeletePipelineStage = useCallback((stageId: string) => {
        setPipelineStages(prev => prev.filter(s => s.id !== stageId));
    }, []);
    
    const handleAddWorkflow = useCallback((workflow: WorkflowRule) => {
        setWorkflows(prev => [...prev, workflow]);
    }, []);

    const handleDeleteWorkflow = useCallback((workflowId: string) => {
        setWorkflows(prev => prev.filter(w => w.id !== workflowId));
    }, []);
    
    const handleUpdateWorkflow = useCallback((updatedWorkflow: WorkflowRule) => {
        setWorkflows(prev => prev.map(w => w.id === updatedWorkflow.id ? updatedWorkflow : w));
    }, []);

    const handleAddUser = useCallback((user: User) => {
        setAllUsers(prev => [...prev, user]);
    }, []);
    
    const handleUpdateUser = useCallback((updatedUser: User) => {
        setAllUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
    }, []);

    const handleDeleteUser = useCallback((userId: string) => {
        setAllUsers(prev => prev.filter(u => u.id !== userId));
    }, []);

    const handleAddRoundRobinRule = useCallback((rule: RoundRobinRule) => {
        setRoundRobinRules(prev => [...prev, rule]);
    }, []);

    const handleDeleteRoundRobinRule = useCallback((ruleId: string) => {
        setRoundRobinRules(prev => prev.filter(r => r.id !== ruleId));
    }, []);

    const handleAddTask = useCallback((task: Task) => {
        setTasks(prev => [task, ...prev]);
    }, []);

    const handleUpdateTask = useCallback((updatedTask: Task) => {
        setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
    }, []);

    const value: AppContextType = {
        allUsers,
        assignableUsers,
        pipelineStages,
        customFields,
        roundRobinRules,
        workflows,
        tasks,
        allLeads,
        addCustomField: handleAddCustomField,
        deleteCustomField: handleDeleteCustomField,
        addPipelineStage: handleAddPipelineStage,
        deletePipelineStage: handleDeletePipelineStage,
        addWorkflow: handleAddWorkflow,
        deleteWorkflow: handleDeleteWorkflow,
        updateWorkflow: handleUpdateWorkflow,
        addUser: handleAddUser,
        updateUser: handleUpdateUser,
        deleteUser: handleDeleteUser,
        addRoundRobinRule: handleAddRoundRobinRule,
        deleteRoundRobinRule: handleDeleteRoundRobinRule,
        addTask: handleAddTask,
        updateTask: handleUpdateTask,
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppContextProvider');
  }
  return context;
}
