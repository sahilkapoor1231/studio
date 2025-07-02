import { getLeads, getUsers, getTasks } from '@/lib/data'
import type { Lead, Task, User } from '@/lib/types'
import { ReportsView } from '@/components/reports/reports-view'
import { isToday, parseISO } from 'date-fns'

export default async function ReportsPage() {
  // Fetch data on the server
  const [leads, users, tasks] = await Promise.all([getLeads(), getUsers(), getTasks()])

  // Perform calculations on the server
  const leadsBySource = (() => {
    if (!leads.length) return []
    const sourceCounts = leads.reduce<Record<string, number>>((acc, lead) => {
      acc[lead.source] = (acc[lead.source] || 0) + 1
      return acc
    }, {})

    return Object.entries(sourceCounts).map(([source, count], index) => ({
      source,
      leads: count,
      fill: `var(--color-chart-${(index % 5) + 1})`,
    }))
  })()

  const conversionByCounselor = (() => {
    if (!leads.length || !users.length) return []
    const counselors = users.filter((u) => u.role === 'Counselor')

    return counselors.map((counselor) => {
      const assignedLeads = leads.filter((lead) => lead.assignedTo.id === counselor.id)
      const convertedLeads = assignedLeads.filter((lead) => lead.status === 'Converted').length
      const totalLeads = assignedLeads.length
      
      return {
        name: counselor.name.split(' ')[0], // Show first name
        converted: convertedLeads,
        total: totalLeads,
      }
    })
  })()

  const tasksCompletedToday = (() => {
    if (!tasks.length || !users.length) return [];
    
    const completedToday = tasks.filter(task => 
        task.status === 'Done' && 
        task.completedAt && 
        isToday(parseISO(task.completedAt)) &&
        task.completedBy
    );
    
    const countsByUser = completedToday.reduce<Record<string, number>>((acc, task) => {
        const userId = task.completedBy!.id;
        acc[userId] = (acc[userId] || 0) + 1;
        return acc;
    }, {});
    
    return Object.entries(countsByUser).map(([userId, count]) => {
        const user = users.find(u => u.id === userId);
        return {
            userId,
            name: user ? user.name : 'Unknown User',
            avatarUrl: user ? user.avatarUrl : '',
            count
        };
    }).sort((a,b) => b.count - a.count); // Sort by most tasks completed

  })();


  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
        <p className="text-muted-foreground">
          Analyze your lead performance and conversion metrics.
        </p>
      </div>

      <ReportsView
        leadsBySource={leadsBySource}
        conversionByCounselor={conversionByCounselor}
        tasksCompletedToday={tasksCompletedToday}
      />
    </div>
  )
}
