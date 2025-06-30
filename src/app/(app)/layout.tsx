import { Sidebar, SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { AppHeader } from "@/components/app-header"
import { getCustomFields, getPipelineStages, getUsers } from "@/lib/data"
import { AppContextProvider } from "@/lib/app-context"

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Fetch common data once here
  const [customFields, pipelineStages, allUsers] = await Promise.all([
      getCustomFields(),
      getPipelineStages(),
      getUsers(),
  ]);

  // Pre-filter users who can be assigned leads
  const assignableUsers = allUsers.filter(u => u.role === 'Counselor' || u.role === 'Receptionist');

  const contextValue = { allUsers, assignableUsers, pipelineStages, customFields };

  return (
    <AppContextProvider value={contextValue}>
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
