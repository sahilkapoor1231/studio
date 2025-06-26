'use client'

import type { Lead, LeadStatus } from '@/lib/types'
import { useDroppable } from '@dnd-kit/core'
import { LeadCard } from './lead-card'
import { Button } from '../ui/button'
import { Plus } from 'lucide-react'
import { AddLeadDialog } from '../add-lead-dialog'
import { ScrollArea } from '../ui/scroll-area'

export function PipelineColumn({ title, leads, onLeadAdded }: { title: LeadStatus, leads: Lead[], onLeadAdded: (newLead: Lead) => void }) {
    const { setNodeRef, isOver } = useDroppable({
        id: title,
    });

    return (
        <div className="flex-1 min-w-[300px] flex flex-col">
            <div className={`bg-muted/50 rounded-lg p-4 pt-3 flex flex-col flex-1 transition-colors ${isOver ? 'bg-accent/20' : ''}`}>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="font-semibold">{title}</h2>
                    <span className="text-sm font-medium text-muted-foreground bg-background px-2 py-0.5 rounded-full">{leads.length}</span>
                </div>
                <ScrollArea className="flex-1">
                    <div ref={setNodeRef} className="space-y-4 min-h-[100px] pr-3">
                        {leads.map(lead => <LeadCard key={lead.id} lead={lead} />)}
                    </div>
                </ScrollArea>
                <AddLeadDialog onLeadAdded={onLeadAdded} defaultStatus={title}>
                    <Button variant="ghost" className="w-full mt-4">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Lead
                    </Button>
                </AddLeadDialog>
            </div>
        </div>
    )
}
