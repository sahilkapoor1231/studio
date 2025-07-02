'use client'

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { Badge } from '../ui/badge'

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
  count: number;
}[]

type PendingTasksData = {
  userId: string;
  name: string;
  avatarUrl: string;
  pending: number;
  overdue: number;
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
                        <TableCell className="text-right font-bold text-lg">{userStats.count}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
        </Card>
        
        <Card>
            <CardHeader>
              <CardTitle>Pending & Overdue Tasks</CardTitle>
              <CardDescription>
                A summary of outstanding tasks assigned to each user.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead className="text-right">Pending</TableHead>
                    <TableHead className="text-right">Overdue</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingTasksByUser.length === 0 ? (
                      <TableRow>
                          <TableCell colSpan={4} className="h-24 text-center">
                              No pending tasks. Great job!
                          </TableCell>
                      </TableRow>
                  ) : (
                      pendingTasksByUser.map(userStats => (
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
                          <TableCell className="text-right">{userStats.pending}</TableCell>
                          <TableCell className="text-right">
                          {userStats.overdue > 0 ? (
                                  <Badge variant="destructive">{userStats.overdue}</Badge>
                              ) : (
                                  0
                              )}
                          </TableCell>
                          <TableCell className="text-right font-bold text-lg">{userStats.pending + userStats.overdue}</TableCell>
                      </TableRow>
                      ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
        </Card>
      </div>
    </div>
  )
}
