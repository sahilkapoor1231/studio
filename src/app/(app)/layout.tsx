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
import Link from "next/link"

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
    const scheduledTimeouts = useRef<NodeJS.Timeout[]>([]);
    const notifiedDueToday = useRef<Set<string>>(new Set());

    useEffect(() => {
        // Clear all previous timeouts when dependencies change to ensure we reschedule everything correctly
        scheduledTimeouts.current.forEach(clearTimeout);
        scheduledTimeouts.current = [];

        if (!tasks || !workflows || !allLeads) return;

        // --- Schedule "Due Today" notifications ---
        const tasksDueToday = tasks.filter(task => 
            task.status === 'Pending' && isToday(parseISO(task.dueDate))
        );
        
        tasksDueToday.forEach((task, index) => {
            if (!notifiedDueToday.current.has(task.id)) {
                const timeoutId = setTimeout(() => {
                    toast({
                        title: 'Task Due Today',
                        description: (
                            <span>
                                Your task "{task.title}" for <Link href={`/leads/${task.lead.id}`} className="font-bold text-primary hover:underline">{task.lead.name}</Link> is due today.
                            </span>
                        )
                    });
                    notifiedDueToday.current.add(task.id);
                }, 1000 + index * 500); // Stagger to avoid toast overload
                scheduledTimeouts.current.push(timeoutId);
            }
        });

        // --- Schedule "Reminder" notifications based on workflows ---
        const reminderWorkflows = workflows.filter(
            (w): w is WorkflowRule & { action: SendNotificationAction } => 
                w.status === 'active' && 
                w.trigger.type === 'TASK_CREATED' && 
                w.action.type === 'SEND_NOTIFICATION'
        );

        if (reminderWorkflows.length === 0) return;

        tasks.forEach(task => {
            if (task.status !== 'Pending') return;
            
            const lead = allLeads.find(l => l.id === task.lead.id);
            if (!lead) return;

            reminderWorkflows.forEach(workflow => {
                const taskCategory = (task.type === 'Call' || task.type === 'Message') ? 'Follow-up' : 'Appointment';
                const triggerMatches = workflow.trigger.value === 'ANY' || workflow.trigger.value === taskCategory;

                if (triggerMatches && checkConditions(lead, workflow.conditions)) {
                    const action = workflow.action;
                    const dueDate = parseISO(task.dueDate);
                    
                    if (dueDate < new Date()) return; // Don't schedule for past tasks
                    
                    const notificationTime = new Date(dueDate.getTime() - action.minutesBefore * 60000);
                    const delay = notificationTime.getTime() - Date.now();

                    if (delay > 0) {
                        const timeoutId = setTimeout(() => {
                            const messageParts = action.template
                                .replace(/{{task.title}}/g, task.title)
                                .replace(/{{lead.assignedTo.name}}/g, lead.assignedTo.name)
                                .split('{{lead.name}}');

                            toast({
                                title: 'Task Reminder',
                                description: (
                                    <span>
                                        {messageParts[0]}
                                        {messageParts.length > 1 && (
                                            <Link href={`/leads/${task.lead.id}`} className="font-bold text-primary hover:underline">{lead.name}</Link>
                                        )}
                                        {messageParts[1]}
                                    </span>
                                ),
                            });
                        }, delay);
                        scheduledTimeouts.current.push(timeoutId);
                    }
                }
            });
        });

        // Cleanup function to clear all timeouts when the component unmounts or effect re-runs
        return () => {
            scheduledTimeouts.current.forEach(clearTimeout);
        };
    }, [workflows, tasks, allLeads, toast]);

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
