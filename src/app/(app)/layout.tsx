'use client'

import { Sidebar, SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { AppHeader } from "@/components/app-header"
import { getCustomFields, getPipelineStages, getUsers, getWorkflows, getRoundRobinRules, getTasks } from "@/lib/data"
import { AppContextProvider } from "@/lib/app-context"
import { useEffect, useState } from "react"
import type { User, PipelineStage, CustomFieldDefinition, WorkflowRule, RoundRobinRule, Task } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import { isToday, parseISO } from "date-fns"

type InitialData = {
    allUsers: User[];
    assignableUsers: User[];
    pipelineStages: PipelineStage[];
    customFields: CustomFieldDefinition[];
    workflows: WorkflowRule[];
    roundRobinRules: RoundRobinRule[];
};


export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [initialData, setInitialData] = useState<InitialData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    async function loadInitialData() {
      const [customFields, pipelineStages, allUsers, workflows, roundRobinRules, tasks] = await Promise.all([
        getCustomFields(),
        getPipelineStages(),
        getUsers(),
        getWorkflows(),
        getRoundRobinRules(),
        getTasks(),
      ]);
      const assignableUsers = allUsers.filter(u => u.role === 'Counselor' || u.role === 'Receptionist');
      setInitialData({ allUsers, assignableUsers, pipelineStages, customFields, workflows, roundRobinRules });

      // Task Reminders
      const tasksDueToday = tasks.filter(task => isToday(parseISO(task.dueDate)) && task.status === 'Pending');
      tasksDueToday.forEach((task, index) => {
        setTimeout(() => {
          toast({
            title: 'Task Reminder',
            description: `Your task "${task.title}" is due today.`
          })
        }, index * 500); // Stagger toasts
      });

      setIsLoading(false);
    }
    loadInitialData();
  }, [toast]);

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
