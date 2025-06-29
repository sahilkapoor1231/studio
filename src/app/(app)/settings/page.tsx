'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowRight, PlusCircle, Tag, Trash2, Workflow } from 'lucide-react'
import type { CustomFieldDefinition, PipelineStage, WorkflowRule, User, UpdateLeadFieldAction, AddTagAction } from '@/lib/types'
import { getCustomFields, deleteCustomField, getWorkflows, deleteWorkflow, getPipelineStages, deletePipelineStage, getUsers } from '@/lib/data'
import { AddCustomFieldDialog } from '@/components/settings/add-custom-field-dialog'
import { AddStageDialog } from '@/components/settings/add-stage-dialog'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AddWorkflowDialog } from '@/components/settings/add-workflow-dialog'

export default function SettingsPage() {
    const [fields, setFields] = useState<CustomFieldDefinition[]>([]);
    const [stages, setStages] = useState<PipelineStage[]>([]);
    const [workflows, setWorkflows] = useState<WorkflowRule[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        async function loadData() {
            setIsLoading(true);
            const [customFields, pipelineStages, workflowRules, userList] = await Promise.all([
                getCustomFields(),
                getPipelineStages(),
                getWorkflows(),
                getUsers()
            ]);
            setFields(customFields);
            setStages(pipelineStages);
            setWorkflows(workflowRules);
            setUsers(userList.filter(u => u.role === 'Counselor' || u.role === 'Receptionist'));
            setIsLoading(false);
        }
        loadData();
    }, []);

    const handleFieldAdded = (newField: CustomFieldDefinition) => setFields(prev => [...prev, newField]);
    const handleStageAdded = (newStage: PipelineStage) => setStages(prev => [...prev, newStage]);
    const handleWorkflowAdded = (newWorkflow: WorkflowRule) => setWorkflows(prev => [...prev, newWorkflow]);

    const handleDeleteField = async (fieldId: string) => {
        const { success } = await deleteCustomField(fieldId);
        if (success) {
            setFields(prev => prev.filter(f => f.id !== fieldId));
            toast({ title: "Field Deleted", description: "The custom field has been removed." });
        } else {
             toast({ title: "Error", description: "Failed to delete field.", variant: "destructive" });
        }
    }
    
    const handleDeleteStage = async (stageId: string) => {
        const { success } = await deletePipelineStage(stageId);
        if (success) {
            setStages(prev => prev.filter(s => s.id !== stageId));
            toast({ title: "Stage Deleted", description: "The pipeline stage has been removed." });
        } else {
            toast({ title: "Error", description: "Failed to delete stage.", variant: "destructive" });
        }
    }

    const handleDeleteWorkflow = async (workflowId: string) => {
        const { success } = await deleteWorkflow(workflowId);
        if (success) {
            setWorkflows(prev => prev.filter(w => w.id !== workflowId));
            toast({ title: "Workflow Deleted", description: "The automation rule has been removed." });
        } else {
            toast({ title: "Error", description: "Failed to delete workflow.", variant: "destructive" });
        }
    }

    const getActionDisplayValue = (action: UpdateLeadFieldAction) => {
        if (action.field === 'assignedToId') {
            return users.find(u => u.id === action.value)?.name || action.value;
        }
        return action.value;
    }

    return (
        <div className="space-y-6">
             <div>
                <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                <p className="text-muted-foreground">Manage your CRM settings, customizations, and automations.</p>
            </div>

            <Tabs defaultValue="fields">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="fields">Custom Fields</TabsTrigger>
                    <TabsTrigger value="pipeline">Pipeline Stages</TabsTrigger>
                    <TabsTrigger value="workflows">Workflows</TabsTrigger>
                </TabsList>

                <TabsContent value="fields" className="mt-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Custom Lead Fields</CardTitle>
                                <CardDescription>Create and manage your own fields for lead forms.</CardDescription>
                            </div>
                            <AddCustomFieldDialog onFieldAdded={handleFieldAdded}>
                                <Button variant="outline"><PlusCircle className="mr-2 h-4 w-4" /> Add Field</Button>
                            </AddCustomFieldDialog>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-md border">
                                {isLoading ? (
                                    <div className="p-4 space-y-4"><Skeleton className="h-10 w-full" /><Skeleton className="h-10 w-full" /></div>
                                ) : fields.length === 0 ? (
                                    <div className="text-center p-8 text-muted-foreground">No custom fields created yet.</div>
                                ) : (
                                    fields.map((field, index) => (
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
                                                    <Trash2 className="h-4 w-4 text-destructive" /><span className="sr-only">Delete {field.label}</span>
                                                </Button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="pipeline" className="mt-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Pipeline Stages</CardTitle>
                                <CardDescription>Define the columns for your sales pipeline.</CardDescription>
                            </div>
                            <AddStageDialog onStageAdded={handleStageAdded}>
                                <Button variant="outline"><PlusCircle className="mr-2 h-4 w-4" /> Add Stage</Button>
                            </AddStageDialog>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-md border">
                                {isLoading ? (
                                    <div className="p-4 space-y-4"><Skeleton className="h-10 w-full" /><Skeleton className="h-10 w-full" /></div>
                                ) : stages.length === 0 ? (
                                    <div className="text-center p-8 text-muted-foreground">No pipeline stages defined yet.</div>
                                ) : (
                                    stages.map((stage, index) => (
                                        <div key={stage.id} className={`flex items-center justify-between p-4 ${index < stages.length - 1 ? 'border-b' : ''}`}>
                                            <p className="font-medium">{stage.name}</p>
                                            <Button variant="ghost" size="icon" onClick={() => handleDeleteStage(stage.id)}>
                                                <Trash2 className="h-4 w-4 text-destructive" /><span className="sr-only">Delete {stage.name}</span>
                                            </Button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
                
                <TabsContent value="workflows" className="mt-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Workflow Automations</CardTitle>
                                <CardDescription>Create rules to automate repetitive tasks.</CardDescription>
                            </div>
                            <AddWorkflowDialog onWorkflowAdded={handleWorkflowAdded} pipelineStages={stages} users={users}>
                                <Button variant="outline"><PlusCircle className="mr-2 h-4 w-4" /> Add Workflow</Button>
                            </AddWorkflowDialog>
                        </CardHeader>
                        <CardContent>
                             <div className="space-y-4">
                                {isLoading ? (
                                    <div className="p-4 space-y-4"><Skeleton className="h-24 w-full" /></div>
                                ) : workflows.length === 0 ? (
                                    <div className="text-center p-8 text-muted-foreground rounded-md border">No workflows created yet.</div>
                                ) : (
                                    workflows.map((rule) => (
                                        <div key={rule.id} className="rounded-lg border bg-card p-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <Workflow className="h-5 w-5 text-primary" />
                                                    <h4 className="font-semibold">{rule.name}</h4>
                                                </div>
                                                <Button variant="ghost" size="icon" onClick={() => handleDeleteWorkflow(rule.id)}>
                                                    <Trash2 className="h-4 w-4 text-destructive" /><span className="sr-only">Delete {rule.name}</span>
                                                </Button>
                                            </div>
                                            <div className="mt-4 flex items-center justify-center gap-2 sm:gap-4 text-sm text-muted-foreground">
                                                <div className="flex-1 rounded-md border p-3 text-center bg-background">
                                                    <p className="font-medium text-foreground">WHEN</p>
                                                    {rule.trigger.type === 'LEAD_STATUS_CHANGED' ? (
                                                        <>
                                                            <p className="mt-1 text-xs sm:text-sm">Lead status changes to</p>
                                                            <Badge variant="secondary" className="mt-2">{rule.trigger.value}</Badge>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <p className="mt-1 text-xs sm:text-sm">A new lead is created</p>
                                                        </>
                                                    )}
                                                </div>
                                                <ArrowRight className="h-6 w-6 shrink-0 text-muted-foreground" />
                                                <div className="flex-1 rounded-md border p-3 text-center bg-background">
                                                    <p className="font-medium text-foreground">THEN</p>
                                                    {rule.action.type === 'CREATE_TASK' ? (
                                                        <>
                                                            <p className="mt-1 text-xs sm:text-sm">Create a new task</p>
                                                            <code className="mt-2 text-xs bg-muted text-muted-foreground rounded px-2 py-1 block truncate">"{rule.action.template}"</code>
                                                        </>
                                                    ) : rule.action.type === 'UPDATE_LEAD_FIELD' ? (
                                                        <>
                                                            <p className="mt-1 text-xs sm:text-sm">Update lead field</p>
                                                            <div className="mt-2 text-xs space-x-1">
                                                                <span>Set</span>
                                                                <Badge variant="outline">{rule.action.field === 'assignedToId' ? 'Assigned To' : 'Status'}</Badge>
                                                                <span>to</span>
                                                                <Badge variant="secondary">{getActionDisplayValue(rule.action)}</Badge>
                                                            </div>
                                                        </>
                                                    ) : rule.action.type === 'ADD_TAG' ? (
                                                        <>
                                                             <p className="mt-1 text-xs sm:text-sm">Add a tag</p>
                                                            <Badge variant="outline" className="mt-2"><Tag className="mr-1 h-3 w-3" /> {rule.action.tag}</Badge>
                                                        </>
                                                    ) : null}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
