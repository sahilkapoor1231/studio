'use client'

import { useState } from 'react'
import type { Lead } from '@/lib/types'
import { summarizeLead, type SummarizeLeadOutput as AIInsight } from '@/ai/flows/summarize-lead-flow'
import { Button } from '../ui/button'
import { Sparkles, CheckCircle, Lightbulb } from 'lucide-react'
import { Card, CardContent } from '../ui/card'
import { Badge } from '../ui/badge'
import { Skeleton } from '../ui/skeleton'
import { Alert, AlertDescription, AlertTitle } from '../ui/alert'

export function AIInsights({ lead }: { lead: Lead }) {
    const [insights, setInsights] = useState<AIInsight | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleGenerateInsights = async () => {
        setIsLoading(true)
        setError(null)
        try {
            const result = await summarizeLead({
                name: lead.name,
                inquiryType: lead.inquiryType,
                history: lead.history,
                notes: lead.notes,
                customFields: lead.customFields
            })
            setInsights(result)
        } catch (e) {
            console.error(e)
            setError('Failed to generate insights. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }
    
    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="space-y-6">
                    <div>
                        <Skeleton className="h-6 w-1/4 mb-2" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-5/6 mt-1" />
                    </div>
                    <div>
                        <Skeleton className="h-6 w-1/3 mb-2" />
                        <Skeleton className="h-8 w-20" />
                    </div>
                    <div>
                        <Skeleton className="h-6 w-1/2 mb-2" />
                        <div className="space-y-2">
                            <Skeleton className="h-5 w-full" />
                            <Skeleton className="h-5 w-full" />
                            <Skeleton className="h-5 w-full" />
                        </div>
                    </div>
                </div>
            )
        }

        if (error) {
            return (
                 <Alert variant="destructive">
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )
        }

        if (insights) {
            return (
                <div className="space-y-6">
                    <div>
                        <h3 className="text-lg font-semibold mb-2">Summary</h3>
                        <p className="text-muted-foreground">{insights.summary}</p>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold mb-2">Lead Temperature</h3>
                        <Badge variant={
                            insights.temperature === 'Hot' ? 'destructive' : 
                            insights.temperature === 'Warm' ? 'secondary' :
                            'outline'
                        }>
                            {insights.temperature}
                        </Badge>
                    </div>
                    <div>
                         <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                            <Lightbulb className="h-5 w-5 text-primary" />
                            Suggested Next Steps
                        </h3>
                        <ul className="list-none space-y-2">
                           {insights.suggestedNextSteps.map((step, i) => (
                               <li key={i} className="flex items-start gap-3">
                                   <CheckCircle className="h-5 w-5 text-accent mt-0.5 shrink-0" />
                                   <span className="text-muted-foreground">{step}</span>
                               </li>
                           ))}
                        </ul>
                    </div>
                </div>
            )
        }
        
        return (
            <div className="text-center py-10">
                <Sparkles className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-2 text-lg font-medium">Unlock AI Insights</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                    Get a summary, lead temperature, and next steps powered by AI.
                </p>
                <Button onClick={handleGenerateInsights} className="mt-4" disabled={isLoading}>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate Insights
                </Button>
            </div>
        )
    }

    return (
       <Card>
           <CardContent className="pt-6">
             {renderContent()}
           </CardContent>
       </Card>
    )
}
