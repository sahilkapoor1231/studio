'use client'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'

const leadsBySource = [
  { source: 'Website', leads: 120, fill: 'var(--color-chart-1)' },
  { source: 'Facebook', leads: 98, fill: 'var(--color-chart-2)' },
  { source: 'Walk-in', leads: 45, fill: 'var(--color-chart-3)' },
  { source: 'WhatsApp', leads: 73, fill: 'var(--color-chart-4)' },
  { source: 'IVR', leads: 30, fill: 'var(--color-chart-5)' },
]

const conversionByCounselor = [
  { name: 'Alex C.', converted: 24, total: 80 },
  { name: 'Sam T.', converted: 18, total: 65 },
  { name: 'Mia G.', converted: 32, total: 90 },
  { name: 'Jane D.', converted: 12, total: 50 },
]

export default function ReportsPage() {
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
                            tickFormatter={(value) => `${(value / 100) * 100}%`}
                            domain={[0, 100]}
                         />
                        <ChartTooltip
                            formatter={(value, name, props) => {
                                const { payload } = props
                                const rate = (payload.converted / payload.total * 100).toFixed(1)
                                return [`${rate}%`, 'Conversion Rate']
                            }}
                            content={<ChartTooltipContent />}
                        />
                        <Bar dataKey={(data) => (data.converted / data.total) * 100} name="Conversion Rate" fill="var(--color-chart-2)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
