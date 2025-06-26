'use client'

import { useEffect, useState } from "react"
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'

import { getLeads } from "@/lib/data"
import type { Lead, LeadStatus } from "@/lib/types"
import { PipelineColumn } from "@/components/pipeline/pipeline-column"
import { LeadCard } from "@/components/pipeline/lead-card"
import { createPortal } from "react-dom"

const pipelineStages: LeadStatus[] = [
  'New',
  'Contacted',
  'Qualified',
  'Appointment Scheduled',
  'Converted',
];


export default function PipelinePage() {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [activeLead, setActiveLead] = useState<Lead | null>(null);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
        async function loadLeads() {
            const initialLeads = await getLeads();
            setLeads(initialLeads);
        }
        loadLeads();
    }, []);

    const sensors = useSensors(
        useSensor(PointerSensor, {
          activationConstraint: {
            distance: 8,
          },
        })
    );

    const handleDragStart = (event: DragStartEvent) => {
        if (event.active.data.current?.lead) {
            setActiveLead(event.active.data.current.lead);
        }
    };

    function handleDragEnd(event: DragEndEvent) {
        setActiveLead(null);
        const { active, over } = event;

        if (over && active.id !== over.id) {
            setLeads((prevLeads) => {
                const leadIndex = prevLeads.findIndex(l => l.id === active.id);
                if (leadIndex === -1) return prevLeads;

                const updatedLeads = [...prevLeads];
                const movedLead = { ...updatedLeads[leadIndex], status: over.id as LeadStatus };
                updatedLeads[leadIndex] = movedLead;

                return updatedLeads;
            });
        }
    }

    const handleLeadAdded = (newLead: Lead) => {
        setLeads(prev => [...prev, newLead]);
    }

    return (
        <DndContext 
            sensors={sensors}
            onDragStart={handleDragStart} 
            onDragEnd={handleDragEnd}
        >
            <div className="space-y-6 h-full flex flex-col">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Sales Pipeline</h1>
                    <p className="text-muted-foreground">Visualize and manage your lead flow by dragging cards.</p>
                </div>
                <div className="flex-1 overflow-x-auto pb-4">
                    <div className="flex gap-6 h-full">
                        {pipelineStages.map(stage => (
                            <PipelineColumn 
                                key={stage}
                                title={stage}
                                leads={leads.filter(l => l.status === stage)}
                                onLeadAdded={handleLeadAdded}
                            />
                        ))}
                    </div>
                </div>
                 {isClient && createPortal(
                    <DragOverlay dropAnimation={null}>
                        {activeLead ? <LeadCard lead={activeLead} isOverlay /> : null}
                    </DragOverlay>,
                    document.body
                )}
            </div>
        </DndContext>
    )
}
