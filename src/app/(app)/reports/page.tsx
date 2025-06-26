'use client'

import { useEffect, useMemo, useState } from 'react'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { getLeads, getUsers } from '@/lib/data'
import type { Lead, User } from '@/lib/types'
import { Skeleton } from '@/components/ui/skeleton'

export default function ReportsPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      setIsLoading(true)
      const [fetchedLeads, fetchedUsers] = await Promise.all([getLeads(), getUsers()])
      setLeads(fetchedLeads)
      setUsers(fetchedUsers)
      setIsLoading(false)
    }
    loadData()
  }, [])

  const leadsBySource = useMemo(() => {
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
  }, [leads])

  const conversionByCounselor = useMemo(() => {
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
  }, [leads, users])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
            <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
            <p className="text-muted-foreground">
              Analyze your lead performance and conversion metrics.
            </p>
        </div>
        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
            <Card>
                <CardHeader>
                    <Skeleton className="h-7 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-[300px] w-full" />
                </CardContent>
            </Card>
             <Card>
                <CardHeader>
                    <Skeleton className="h-7 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-[300px] w-full" />
                </CardContent>
            </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
        <p className="text-muted-foreground">
          Analyze your lead performance and conversion metrics.
        </p>
      </div>

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
                  <ChartTooltip
                    content={<ChartTooltipContent />}
                  />
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
    </div>
  )
}
