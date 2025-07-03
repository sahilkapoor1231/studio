'use server'

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
    
    type UserTaskStats = {
        tasks: Task[];
        counts: Record<Task['type'], number>;
    };

    const statsByUser = completedToday.reduce<Record<string, UserTaskStats>>((acc, task) => {
        const userId = task.completedBy!.id;
        if (!acc[userId]) {
            acc[userId] = { tasks: [], counts: { Call: 0, Message: 0, Appointment: 0 } };
        }
        acc[userId].tasks.push(task);
        acc[userId].counts[task.type]++;
        return acc;
    }, {});
    
    return Object.entries(statsByUser).map(([userId, stats]) => {
        const user = users.find(u => u.id === userId);
        const total = stats.tasks.length;
        return {
            userId,
            name: user ? user.name : 'Unknown User',
            avatarUrl: user ? user.avatarUrl : '',
            tasks: stats.tasks,
            counts: stats.counts,
            total
        };
    }).sort((a,b) => b.total - a.total);

  })();

  const pendingTasksByUser = (() => {
    if (!tasks.length || !users.length) return [];
    
    const pendingAndOverdue = tasks.filter(task => 
        (task.status === 'Pending' || task.status === 'Overdue') && task.assignedTo
    );
    
    const tasksByUser = pendingAndOverdue.reduce<Record<string, { pending: Task[], overdue: Task[] }>>((acc, task) => {
        const userId = task.assignedTo.id;
        if (!acc[userId]) {
            acc[userId] = { pending: [], overdue: [] };
        }
        if (task.status === 'Pending') {
            acc[userId].pending.push(task);
        } else if (task.status === 'Overdue') {
            acc[userId].overdue.push(task);
        }
        return acc;
    }, {});
    
    return Object.entries(tasksByUser).map(([userId, userTasks]) => {
        const user = users.find(u => u.id === userId);
        const total = userTasks.pending.length + userTasks.overdue.length;
        
        return {
            userId,
            name: user ? user.name : 'Unknown User',
            avatarUrl: user ? user.avatarUrl : '',
            pendingTasks: userTasks.pending,
            overdueTasks: userTasks.overdue,
            total,
        };
    }).sort((a,b) => b.total - a.total); // Sort by most tasks

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
        pendingTasksByUser={pendingTasksByUser}
      />
    </div>
  )
}
