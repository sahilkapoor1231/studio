'use client'

import { Sidebar, SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { AppHeader } from "@/components/app-header"
import { getCustomFields, getPipelineStages, getUsers, getWorkflows, getRoundRobinRules, getTasks, getLeads } from "@/lib/data"
import { AppContextProvider, useAppContext } from "@/lib/app-context"
import { useEffect, useState, useRef } from "react"
import type { User, PipelineStage, CustomFieldDefinition, WorkflowRule, RoundRobinRule, Task, Lead, SendNotificationAction, WorkflowCondition } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import { isToday, parseISO } from "date-fns"

type InitialData = {
    allUsers: User[];
    assignableUsers: User[];
    pipelineStages: PipelineStage[];
    customFields: CustomFieldDefinition[];
    workflows: WorkflowRule[];
    roundRobinRules: RoundRobinRule[];
    tasks: Task[];
    allLeads: Lead[];
};

const checkConditions = (lead: Lead, conditions: WorkflowRule['conditions']): boolean => {
    if (!conditions || conditions.length === 0) return true;
    for (const condition of conditions) {
        const leadValue = lead[condition.field as keyof Lead];
        if (condition.operator === 'EQUALS' && leadValue !== condition.value) return false;
        if (condition.operator === 'NOT_EQUALS' && leadValue === condition.value) return false;
    }
    return true;
}

function NotificationScheduler() {
    const { workflows, tasks, allLeads } = useAppContext();
    const { toast } = useToast();
    const notificationTimeouts = useRef<NodeJS.Timeout[]>([]);

    // --- Task Due Today Notifications ---
    useEffect(() => {
        if (!tasks) return;
        const tasksDueToday = tasks.filter(task => isToday(parseISO(task.dueDate)) && task.status === 'Pending');
        tasksDueToday.forEach((task, index) => {
            setTimeout(() => {
            toast({
                title: 'Task Due Today',
                description: `Your task "${task.title}" for ${task.lead.name} is due today.`
            })
            }, 1000 + index * 500); // Stagger toasts and add initial delay
        });
    }, [tasks, toast]);


   // --- Scheduled Task Reminder Notifications ---
    useEffect(() => {
        // Clear existing timeouts to prevent duplicates on re-render
        notificationTimeouts.current.forEach(clearTimeout);
        notificationTimeouts.current = [];

        if (!workflows || !tasks || !allLeads) return;

        const notificationWorkflows = workflows.filter(
            (w): w is WorkflowRule & { action: SendNotificationAction } => 
                w.status === 'active' && 
                w.trigger.type === 'TASK_CREATED' && 
                w.action.type === 'SEND_NOTIFICATION'
        );

        if (notificationWorkflows.length === 0) return;
        
        tasks.forEach(task => {
            if (task.status !== 'Pending') return;

            const lead = allLeads.find(l => l.id === task.lead.id);
            if (!lead) return;

            notificationWorkflows.forEach(workflow => {
                const taskCategory = (task.type === 'Call' || task.type === 'Message') ? 'Follow-up' : 'Appointment';
                const triggerValue = workflow.trigger.value;
                
                if (triggerValue === 'ANY' || triggerValue === taskCategory) {
                    if (checkConditions(lead, workflow.conditions)) {
                        const action = workflow.action;
                        const dueDate = parseISO(task.dueDate);
                        
                        if (dueDate < new Date()) return;
                        
                        const notificationTime = new Date(dueDate.getTime() - action.minutesBefore * 60000);
                        const delay = notificationTime.getTime() - Date.now();
                        
                        if (delay > 0) {
                            const timeoutId = setTimeout(() => {
                                const message = action.template
                                    .replace(/{{task.title}}/g, task.title)
                                    .replace(/{{lead.name}}/g, lead.name);
                                toast({
                                    title: 'Task Reminder',
                                    description: message,
                                });
                            }, delay);
                            notificationTimeouts.current.push(timeoutId);
                        }
                    }
                }
            });
        });
        
        return () => {
            notificationTimeouts.current.forEach(clearTimeout);
        };

    }, [workflows, tasks, allLeads, toast]);

    // This component does not render anything visual
    return null;
}


export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [initialData, setInitialData] = useState<InitialData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadInitialData() {
      const [customFields, pipelineStages, allUsers, workflows, roundRobinRules, tasks, allLeads] = await Promise.all([
        getCustomFields(),
        getPipelineStages(),
        getUsers(),
        getWorkflows(),
        getRoundRobinRules(),
        getTasks(),
        getLeads(),
      ]);
      const assignableUsers = allUsers.filter(u => u.role === 'Counselor' || u.role === 'Receptionist');
      
      const initialPayload = { allUsers, assignableUsers, pipelineStages, customFields, workflows, roundRobinRules, tasks, allLeads };
      setInitialData(initialPayload);
      
      setIsLoading(false);
    }
    loadInitialData();
  }, []);

  if (isLoading || !initialData) {
    // You can render a loading skeleton for the entire layout here
    return (
        <div className="flex min-h-svh w-full">
            <div className="hidden md:block w-16 bg-muted/40 animate-pulse"></div>
            <div className="flex-1 flex flex-col">
                <header className="flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6"></header>
                <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-background"></main>
            </div>
        </div>
    );
  }

  return (
    <AppContextProvider initialData={initialData}>
      <NotificationScheduler />
      <SidebarProvider>
        <Sidebar>
          <AppSidebar />
        </Sidebar>
        <SidebarInset>
          <header className="flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
              <AppHeader />
          </header>
          <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-background overflow-y-auto">
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </AppContextProvider>
  )
}
