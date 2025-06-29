'use client'

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'

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

interface ReportsViewProps {
  leadsBySource: ChartData
  conversionByCounselor: CounselorData
}

export function ReportsView({
  leadsBySource,
  conversionByCounselor,
}: ReportsViewProps) {
  return (
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
  )
}
