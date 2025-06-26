'use client'

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import { Lead } from '@/lib/types'
import { Card, CardContent } from '../ui/card'
import { JourneyTimeline } from './journey-timeline'
import { NotesFeed } from './notes-feed'
import { DocumentManager } from './document-manager'
import { AIInsights } from './ai-insights'
import { Sparkles } from 'lucide-react'

export function PatientJourney({ lead }: { lead: Lead }) {
  return (
    <Tabs defaultValue="journey" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="journey">Journey</TabsTrigger>
        <TabsTrigger value="notes">Notes</TabsTrigger>
        <TabsTrigger value="documents">Documents</TabsTrigger>
        <TabsTrigger value="ai">
            <Sparkles className="mr-2 h-4 w-4" />
            AI Insights
        </TabsTrigger>
      </TabsList>
      <TabsContent value="journey">
        <Card>
          <CardContent className="pt-6">
            <JourneyTimeline history={lead.history} />
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="notes">
        <Card>
          <CardContent className="pt-6">
            <NotesFeed notes={lead.notes} />
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="documents">
        <Card>
          <CardContent className="pt-6">
            <DocumentManager documents={lead.documents} />
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="ai">
        <AIInsights lead={lead} />
      </TabsContent>
    </Tabs>
  )
}
