'use client'

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { Badge } from '../ui/badge'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion'
import { Phone, MessageSquare, Calendar, Info } from 'lucide-react'
import type { Task } from '@/lib/types'
import { format, parseISO } from 'date-fns'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import Link from 'next/link'

type ChartData = {
  source: string
  leads: number
  fill: string
}[]

type CounselorData = {
  name: string
  converted: number
  total: number
}[]

type TasksCompletedData = {
  userId: string;
  name: string;
  avatarUrl: string;
  counts: Record<Task['type'], number>;
  total: number;
}[]

type PendingTasksData = {
  userId: string;
  name: string;
  avatarUrl: string;
  pendingTasks: Task[];
  overdueTasks: Task[];
  total: number;
}[]

interface ReportsViewProps {
  leadsBySource: ChartData
  conversionByCounselor: CounselorData
  tasksCompletedToday: TasksCompletedData
  pendingTasksByUser: PendingTasksData
}

const TaskTooltipContent = ({ tasks, title }: { tasks: Task[], title: string }) => {
    if (tasks.length === 0) return null;
    return (
        <div>
            <h4 className="font-semibold mb-1 text-sm">{title} ({tasks.length})</h4>
            <ul className="list-none space-y-2 text-xs">
                {tasks.slice(0, 5).map(task => (
                    <li key={task.id} className="border-t border-muted/50 pt-2 first:pt-0 first:border-0">
                        <div className="flex justify-between w-full">
                            <span className="truncate font-medium">{task.title}</span>
                            <span className="text-muted-foreground shrink-0 pl-2">{format(parseISO(task.dueDate), 'P')}</span>
                        </div>
                        <span className="text-muted-foreground">
                            for <Link href={`/leads/${task.lead.id}`} className="text-primary hover:underline" onClick={(e) => e.stopPropagation()}>{task.lead.name}</Link>
                        </span>
                    </li>
                ))}
                {tasks.length > 5 && <li className="text-muted-foreground pt-2 border-t border-muted/50">...and {tasks.length - 5} more</li>}
            </ul>
        </div>
    )
}

export function ReportsView({
  leadsBySource,
  conversionByCounselor,
  tasksCompletedToday,
  pendingTasksByUser,
}: ReportsViewProps) {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Lead Volume by Source</CardTitle>
            <CardDescription>
              Shows the total number of leads from each source this quarter.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}} className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={leadsBySource} margin={{ top: 20, right: 20, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="source" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="leads" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Conversion Rate by Counselor</CardTitle>
            <CardDescription>
              Displays the lead conversion performance for each counselor.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}} className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={conversionByCounselor} margin={{ top: 20, right: 20, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis
                    tickFormatter={(value) => `${value}%`}
                    domain={[0, 100]}
                  />
                  <ChartTooltip
                    formatter={(value, name, props) => {
                      const { payload } = props
                      const rate = payload.total > 0 ? ((payload.converted / payload.total) * 100).toFixed(0) : 0
                      return [`${rate}% (${payload.converted}/${payload.total})`, 'Conversion Rate']
                    }}
                    content={<ChartTooltipContent />}
                  />
                  <Bar dataKey={(data) => (data.total > 0 ? (data.converted / data.total) * 100 : 0)} name="Conversion Rate" fill="var(--color-chart-2)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        <Card>
            <CardHeader>
              <CardTitle>Tasks Completed Today</CardTitle>
              <CardDescription>
                A summary of tasks completed by each user for the current day.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead className="text-right">Tasks Completed</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tasksCompletedToday.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={2} className="h-24 text-center">
                            No tasks have been completed today.
                        </TableCell>
                    </TableRow>
                  ) : (
                    tasksCompletedToday.map(userStats => (
                      <TableRow key={userStats.userId}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9">
                              <AvatarImage src={userStats.avatarUrl} alt={userStats.name} data-ai-hint="person face" />
                              <AvatarFallback>{userStats.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{userStats.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                           <div className="flex items-center justify-end gap-x-3 gap-y-1 flex-wrap">
                                <div className="flex items-center gap-1 text-muted-foreground text-sm">
                                    <Phone className="h-3 w-3" />
                                    <span className="font-medium text-foreground">{userStats.counts.Call}</span>
                                </div>
                                <div className="flex items-center gap-1 text-muted-foreground text-sm">
                                    <MessageSquare className="h-3 w-3" />
                                    <span className="font-medium text-foreground">{userStats.counts.Message}</span>
                                </div>
                                <div className="flex items-center gap-1 text-muted-foreground text-sm">
                                    <Calendar className="h-3 w-3" />
                                    <span className="font-medium text-foreground">{userStats.counts.Appointment}</span>
                                </div>
                                <div className="font-bold text-lg min-w-[2rem] text-right">
                                  {userStats.total}
                                </div>
                            </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
        </Card>
        
        <Card>
            <CardHeader>
              <CardTitle>Pending & Overdue Task Analysis</CardTitle>
              <CardDescription>
                A detailed breakdown of outstanding tasks. Click a row to expand.
              </CardDescription>
            </CardHeader>
            <CardContent>
                {pendingTasksByUser.length === 0 ? (
                    <div className="h-24 text-center flex items-center justify-center text-muted-foreground">
                        No pending tasks. Great job!
                    </div>
                ) : (
                    <Accordion type="single" collapsible className="w-full">
                        {pendingTasksByUser.map((userStats) => {
                            const totalPending = userStats.pendingTasks.length;
                            const totalOverdue = userStats.overdueTasks.length;
                            
                            const pendingCalls = userStats.pendingTasks.filter(t => t.type === 'Call').length;
                            const pendingMessages = userStats.pendingTasks.filter(t => t.type === 'Message').length;
                            const pendingAppointments = userStats.pendingTasks.filter(t => t.type === 'Appointment').length;

                            const overdueCalls = userStats.overdueTasks.filter(t => t.type === 'Call').length;
                            const overdueMessages = userStats.overdueTasks.filter(t => t.type === 'Message').length;
                            const overdueAppointments = userStats.overdueTasks.filter(t => t.type === 'Appointment').length;

                            return (
                                <AccordionItem value={userStats.userId} key={userStats.userId}>
                                    <AccordionTrigger asChild>
                                        <div className="flex items-center justify-between w-full hover:bg-muted/50 p-4 cursor-pointer rounded-md">
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-9 w-9">
                                                    <AvatarImage src={userStats.avatarUrl} alt={userStats.name} data-ai-hint="person face" />
                                                    <AvatarFallback>{userStats.name.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                                <span className="font-medium">{userStats.name}</span>
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <div 
                                                            onClick={(e) => e.stopPropagation()} 
                                                            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.stopPropagation(); e.currentTarget.click() }}}
                                                            role="button"
                                                            tabIndex={0}
                                                            className="h-6 w-6 flex items-center justify-center rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                                                        >
                                                            <Info className="h-4 w-4 text-muted-foreground" />
                                                            <span className="sr-only">View task details for {userStats.name}</span>
                                                        </div>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-80 space-y-2 p-3">
                                                        <TaskTooltipContent tasks={userStats.pendingTasks} title="Pending Tasks"/>
                                                        {userStats.overdueTasks.length > 0 && <TaskTooltipContent tasks={userStats.overdueTasks} title="Overdue Tasks"/>}
                                                    </PopoverContent>
                                                </Popover>
                                            </div>
                                            <div className="flex items-center gap-4 text-sm">
                                                <span>Pending: <span className="font-semibold">{totalPending}</span></span>
                                                <span>Overdue: {totalOverdue > 0 ? <Badge variant="destructive">{totalOverdue}</Badge> : <span className="font-semibold">0</span>}</span>
                                                <span className="font-bold">Total: <span className="font-semibold">{userStats.total}</span></span>
                                            </div>
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent className="p-4 bg-muted/50 rounded-b-md border-t">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Status</TableHead>
                                                    <TableHead className="text-center"><Phone className="h-4 w-4 inline mr-1" /> Calls</TableHead>
                                                    <TableHead className="text-center"><MessageSquare className="h-4 w-4 inline mr-1" /> Messages</TableHead>
                                                    <TableHead className="text-center"><Calendar className="h-4 w-4 inline mr-1" /> Appointments</TableHead>
                                                    <TableHead className="text-right font-bold">Total</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                <TableRow>
                                                    <TableCell className="font-medium">Pending</TableCell>
                                                    <TableCell className="text-center">{pendingCalls}</TableCell>
                                                    <TableCell className="text-center">{pendingMessages}</TableCell>
                                                    <TableCell className="text-center">{pendingAppointments}</TableCell>
                                                    <TableCell className="text-right font-bold">{totalPending}</TableCell>
                                                </TableRow>
                                                <TableRow>
                                                    <TableCell className="font-medium text-destructive">Overdue</TableCell>
                                                    <TableCell className="text-center">{overdueCalls > 0 ? <Badge variant="destructive">{overdueCalls}</Badge> : 0}</TableCell>
                                                    <TableCell className="text-center">{overdueMessages > 0 ? <Badge variant="destructive">{overdueMessages}</Badge> : 0}</TableCell>
                                                    <TableCell className="text-center">{overdueAppointments > 0 ? <Badge variant="destructive">{overdueAppointments}</Badge> : 0}</TableCell>
                                                    <TableCell className="text-right font-bold">{totalOverdue > 0 ? <Badge variant="destructive">{totalOverdue}</Badge> : 0}</TableCell>
                                                </TableRow>
                                            </TableBody>
                                        </Table>
                                    </AccordionContent>
                                </AccordionItem>
                            )
                        })}
                    </Accordion>
                )}
            </CardContent>
        </Card>
      </div>
    </div>
  )
}
