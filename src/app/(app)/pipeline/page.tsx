'use client'

import { useEffect, useState } from "react"
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'

import { getLeads } from "@/lib/data"
import type { Lead, PipelineStage } from "@/lib/types"
import { PipelineColumn } from "@/components/pipeline/pipeline-column"
import { LeadCard } from "@/components/pipeline/lead-card"
import { createPortal } from "react-dom"
import { getPipelineStages } from "@/lib/pipeline-stages"
import { Skeleton } from "@/components/ui/skeleton"

export default function PipelinePage() {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [stages, setStages] = useState<PipelineStage[]>([]);
    const [activeLead, setActiveLead] = useState<Lead | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
        async function loadData() {
            setIsLoading(true);
            const [initialLeads, initialStages] = await Promise.all([
                getLeads(),
                getPipelineStages()
            ]);
            setLeads(initialLeads);
            setStages(initialStages);
            setIsLoading(false);
        }
        loadData();
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
                const movedLead = { ...updatedLeads[leadIndex], status: over.id as string };
                updatedLeads[leadIndex] = movedLead;

                return updatedLeads;
            });
        }
    }

    const handleLeadAdded = (newLead: Lead) => {
        setLeads(prev => [newLead, ...prev]);
    }
    
    const renderPipeline = () => {
        if (isLoading) {
            return (
                <div className="flex gap-6 h-full">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="flex-1 min-w-[300px] flex flex-col">
                             <div className="bg-muted/50 rounded-lg p-4 pt-3 flex flex-col flex-1">
                                <div className="flex justify-between items-center mb-4">
                                    <Skeleton className="h-6 w-1/2" />
                                    <Skeleton className="h-6 w-8" />
                                </div>
                                <div className="space-y-4">
                                    <Skeleton className="h-24 w-full" />
                                    <Skeleton className="h-24 w-full" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )
        }

        return (
             <div className="flex gap-6 h-full">
                {stages.map(stage => (
                    <PipelineColumn 
                        key={stage.id}
                        stage={stage}
                        leads={leads.filter(l => l.status === stage.name)}
                        onLeadAdded={handleLeadAdded}
                    />
                ))}
            </div>
        )
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
                    {renderPipeline()}
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
