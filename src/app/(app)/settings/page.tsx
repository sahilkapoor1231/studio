'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PlusCircle, Trash2 } from 'lucide-react'
import type { CustomFieldDefinition, PipelineStage } from '@/lib/types'
import { getCustomFields, deleteCustomField } from '@/lib/custom-fields'
import { getPipelineStages, deletePipelineStage } from '@/lib/pipeline-stages'
import { AddCustomFieldDialog } from '@/components/settings/add-custom-field-dialog'
import { AddStageDialog } from '@/components/settings/add-stage-dialog'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { Skeleton } from '@/components/ui/skeleton'

export default function SettingsPage() {
    const [fields, setFields] = useState<CustomFieldDefinition[]>([]);
    const [stages, setStages] = useState<PipelineStage[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        async function loadData() {
            setIsLoading(true);
            const [customFields, pipelineStages] = await Promise.all([
                getCustomFields(),
                getPipelineStages()
            ]);
            setFields(customFields);
            setStages(pipelineStages);
            setIsLoading(false);
        }
        loadData();
    }, []);

    const handleFieldAdded = (newField: CustomFieldDefinition) => {
        setFields(prev => [...prev, newField]);
    }
    
    const handleStageAdded = (newStage: PipelineStage) => {
        setStages(prev => [...prev, newStage]);
    }

    const handleDeleteField = async (fieldId: string) => {
        const originalFields = [...fields];
        setFields(prev => prev.filter(f => f.id !== fieldId));
        
        const { success } = await deleteCustomField(fieldId);
        if (!success) {
            setFields(originalFields);
            toast({
                title: "Error",
                description: "Could not delete the custom field.",
                variant: "destructive"
            });
        } else {
             toast({
                title: "Field Deleted",
                description: "The custom field has been removed.",
            });
        }
    }
    
    const handleDeleteStage = async (stageId: string) => {
        const originalStages = [...stages];
        setStages(prev => prev.filter(s => s.id !== stageId));

        const { success } = await deletePipelineStage(stageId);
        if(!success) {
            setStages(originalStages);
             toast({
                title: "Error",
                description: "Could not delete the pipeline stage.",
                variant: "destructive"
            });
        } else {
            toast({
                title: "Stage Deleted",
                description: "The pipeline stage has been removed.",
            });
        }
    }

    return (
        <div className="space-y-6">
             <div>
                <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                <p className="text-muted-foreground">Manage your CRM settings and customizations.</p>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Custom Lead Fields</CardTitle>
                            <CardDescription>
                            Create and manage your own fields for the lead creation form.
                            </CardDescription>
                        </div>
                        <AddCustomFieldDialog onFieldAdded={handleFieldAdded}>
                            <Button variant="outline">
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Add Field
                            </Button>
                        </AddCustomFieldDialog>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border">
                            {isLoading && (
                                <div className="p-4 space-y-4">
                                    <Skeleton className="h-10 w-full" />
                                    <Skeleton className="h-10 w-full" />
                                </div>
                            )}
                            {!isLoading && fields.length === 0 && (
                                <div className="text-center p-8 text-muted-foreground">
                                    No custom fields created yet.
                                </div>
                            )}
                            {!isLoading && fields.map((field, index) => (
                                <div key={field.id} className={`flex items-center justify-between p-4 ${index < fields.length - 1 ? 'border-b' : ''}`}>
                                    <div className="flex items-center gap-4">
                                    <div>
                                            <p className="font-medium">{field.label}</p>
                                            <p className="text-sm text-muted-foreground">{field.type}</p>
                                    </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        {field.required && <Badge variant="outline">Required</Badge>}
                                        <Button variant="ghost" size="icon" onClick={() => handleDeleteField(field.id)}>
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                            <span className="sr-only">Delete {field.label}</span>
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Pipeline Stages</CardTitle>
                            <CardDescription>
                               Define the columns for your sales pipeline / kanban board.
                            </CardDescription>
                        </div>
                        <AddStageDialog onStageAdded={handleStageAdded}>
                            <Button variant="outline">
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Add Stage
                            </Button>
                        </AddStageDialog>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border">
                             {isLoading && (
                                <div className="p-4 space-y-4">
                                    <Skeleton className="h-10 w-full" />
                                    <Skeleton className="h-10 w-full" />
                                </div>
                            )}
                            {!isLoading && stages.length === 0 && (
                                <div className="text-center p-8 text-muted-foreground">
                                    No pipeline stages defined yet.
                                </div>
                            )}
                            {!isLoading && stages.map((stage, index) => (
                                <div key={stage.id} className={`flex items-center justify-between p-4 ${index < stages.length - 1 ? 'border-b' : ''}`}>
                                    <p className="font-medium">{stage.name}</p>
                                    <Button variant="ghost" size="icon" onClick={() => handleDeleteStage(stage.id)}>
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                        <span className="sr-only">Delete {stage.name}</span>
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
