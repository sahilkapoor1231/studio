'use client'

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { Badge } from '../ui/badge'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion'
import { Phone, MessageSquare, Calendar } from 'lucide-react'
import type { Task } from '@/lib/types'

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
  counts: {
    pending: Record<Task['type'], number>;
    overdue: Record<Task['type'], number>;
  };
  total: number;
}[]

interface ReportsViewProps {
  leadsBySource: ChartData
  conversionByCounselor: CounselorData
  tasksCompletedToday: TasksCompletedData
  pendingTasksByUser: PendingTasksData
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
                A detailed breakdown of outstanding tasks for each user. Click a user to see details.
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
                            const totalPending = Object.values(userStats.counts.pending).reduce((a, b) => a + b, 0);
                            const totalOverdue = Object.values(userStats.counts.overdue).reduce((a, b) => a + b, 0);

                            return (
                                <AccordionItem value={userStats.userId} key={userStats.userId}>
                                    <AccordionTrigger className="w-full hover:no-underline p-4">
                                        <div className="flex items-center justify-between w-full">
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-9 w-9">
                                                    <AvatarImage src={userStats.avatarUrl} alt={userStats.name} data-ai-hint="person face" />
                                                    <AvatarFallback>{userStats.name.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                                <span className="font-medium">{userStats.name}</span>
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
                                                    <TableCell className="text-center">{userStats.counts.pending.Call}</TableCell>
                                                    <TableCell className="text-center">{userStats.counts.pending.Message}</TableCell>
                                                    <TableCell className="text-center">{userStats.counts.pending.Appointment}</TableCell>
                                                    <TableCell className="text-right font-bold">{totalPending}</TableCell>
                                                </TableRow>
                                                <TableRow>
                                                    <TableCell className="font-medium text-destructive">Overdue</TableCell>
                                                    <TableCell className="text-center">{userStats.counts.overdue.Call > 0 ? <Badge variant="destructive">{userStats.counts.overdue.Call}</Badge> : 0}</TableCell>
                                                    <TableCell className="text-center">{userStats.counts.overdue.Message > 0 ? <Badge variant="destructive">{userStats.counts.overdue.Message}</Badge> : 0}</TableCell>
                                                    <TableCell className="text-center">{userStats.counts.overdue.Appointment > 0 ? <Badge variant="destructive">{userStats.counts.overdue.Appointment}</Badge> : 0}</TableCell>
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
