'use client'

import { useEffect, useState } from "react"
import { DndContext, DragEndEvent, DragStartEvent, PointerSensor, useSensor, useSensors, DragOverlay } from '@dnd-kit/core'
import { createPortal } from "react-dom"

import { getLeads, updateLeadStatus, getPipelineStages } from "@/lib/data"
import type { Lead, PipelineStage } from "@/lib/types"
import { PipelineColumn } from "@/components/pipeline/pipeline-column"
import { LeadCard } from "@/components/pipeline/lead-card"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"

export default function PipelinePage() {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [stages, setStages] = useState<PipelineStage[]>([]);
    const [activeLead, setActiveLead] = useState<Lead | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isClient, setIsClient] = useState(false);
    const { toast } = useToast();

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

    async function handleDragEnd(event: DragEndEvent) {
        setActiveLead(null);
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const newStatus = over.id as string;
            const leadId = active.id as string;
            
            const originalLeads = [...leads];
            const leadToUpdate = originalLeads.find(l => l.id === leadId);
            
            if (leadToUpdate && leadToUpdate.status !== newStatus) {
                 // Optimistically update the UI
                setLeads((prevLeads) => prevLeads.map(l => l.id === leadId ? { ...l, status: newStatus } : l));

                // Update on the "backend"
                const { success, workflowTriggered } = await updateLeadStatus(leadId, newStatus);
                
                if (!success) {
                    // Revert if the update fails
                    setLeads(originalLeads);
                    toast({
                        title: "Error",
                        description: "Could not update lead status. Please try again.",
                        variant: "destructive"
                    });
                    return;
                }

                if (workflowTriggered) {
                     toast({
                        title: "Workflow Triggered ✨",
                        description: `An automated task was created.`
                    });
                }
            }
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
