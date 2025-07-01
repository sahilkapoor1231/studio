'use client'

import { useAppContext } from '@/lib/app-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowRight, Edit, Filter, Mail, MessageSquare, PlusCircle, Tag, Trash2, UserPlus, Workflow } from 'lucide-react'
import type { CustomFieldDefinition, PipelineStage, WorkflowRule, User, UpdateLeadFieldAction, WorkflowCondition, WorkflowAction, RoundRobinRule } from '@/lib/types'
import { deleteCustomField as deleteCustomFieldFromDb, deleteWorkflow as deleteWorkflowFromDb, deletePipelineStage as deletePipelineStageFromDb, deleteUser as deleteUserFromDb, updateWorkflowStatus, deleteRoundRobinRule as deleteRoundRobinRuleFromDb } from '@/lib/data'
import { AddCustomFieldDialog } from '@/components/settings/add-custom-field-dialog'
import { AddStageDialog } from '@/components/settings/add-stage-dialog'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AddWorkflowDialog } from '@/components/settings/add-workflow-dialog'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { InviteUserDialog } from './invite-user-dialog'
import { EditUserDialog } from './edit-user-dialog'
import { Switch } from '@/components/ui/switch'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { AddRoundRobinRuleDialog } from './add-round-robin-rule-dialog'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip'

type FieldWithChildren = CustomFieldDefinition & { children: FieldWithChildren[] };

const buildFieldTree = (fields: CustomFieldDefinition[]): FieldWithChildren[] => {
    const fieldMap: Map<string, FieldWithChildren> = new Map(
        fields.map(f => [f.id, { ...f, children: [] }])
    );
    const tree: FieldWithChildren[] = [];

    fields.forEach(field => {
        const node = fieldMap.get(field.id);
        if (node) {
            if (field.parentId && fieldMap.has(field.parentId)) {
                let parent = fieldMap.get(field.parentId);
                let isAncestor = false;
                while (parent) {
                    if (parent.id === node.id) {
                        isAncestor = true;
                        break;
                    }
                    parent = parent.parentId ? fieldMap.get(parent.parentId) : undefined;
                }
                if (!isAncestor) {
                    fieldMap.get(field.parentId)!.children.push(node);
                } else {
                     tree.push(node);
                }
            } else {
                tree.push(node);
            }
        }
    });

    return tree;
};


const CustomFieldItem = ({ field, level = 0, onFieldDelete }: { field: FieldWithChildren, level?: number, onFieldDelete: (fieldId: string) => void }) => {
    return (
        <div className="group">
            <div className={`flex items-center justify-between p-4 ${level === 0 ? 'border-b' : ''}`}>
                <div className="flex items-center gap-4" style={{ paddingLeft: `${level * 2}rem` }}>
                    {level > 0 && <ArrowRight className="h-4 w-4 text-muted-foreground transform -rotate-45 -translate-y-2" style={{ position: 'absolute', left: `${level * 2 - 1.25}rem` }}/>}
                    <div>
                        <p className="font-medium">{field.label}</p>
                        <p className="text-sm text-muted-foreground">{field.type}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {field.required && <Badge variant="outline">Required</Badge>}
                    <AddCustomFieldDialog parentId={field.id}>
                        <Button size="sm" variant="ghost" className="opacity-0 group-hover:opacity-100 transition-opacity"><PlusCircle className="mr-2 h-4 w-4" /> Sub-field</Button>
                    </AddCustomFieldDialog>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity">
                                <Trash2 className="h-4 w-4 " /><span className="sr-only">Delete {field.label}</span>
                            </Button>
                        </AlertDialogTrigger>
                         <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This will permanently delete the "{field.label}" field and all of its sub-fields. This action cannot be undone.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => onFieldDelete(field.id)} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">Delete</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </div>
            {field.children && field.children.length > 0 && (
                 <div className="border-t">
                    {field.children.map(child => <CustomFieldItem key={child.id} field={child} level={level + 1} onFieldDelete={onFieldDelete} />)}
                </div>
            )}
        </div>
    )
}

export function SettingsView() {
    const {
        customFields,
        pipelineStages,
        workflows,
        allUsers,
        roundRobinRules,
        deleteCustomField,
        deletePipelineStage,
        deleteWorkflow,
        updateWorkflow,
        deleteUser,
        deleteRoundRobinRule,
    } = useAppContext();

    const { toast } = useToast();
    
    const fieldTree = buildFieldTree(customFields);

    const handleDeleteField = async (fieldId: string) => {
        const { success } = await deleteCustomFieldFromDb(fieldId);
        if (success) {
            deleteCustomField(fieldId);
            toast({ title: "Field Deleted", description: "The custom field and its sub-fields have been removed." });
        } else {
             toast({ title: "Error", description: "Failed to delete field.", variant: "destructive" });
        }
    }
    
    const handleDeleteStage = async (stageId: string) => {
        const { success } = await deletePipelineStageFromDb(stageId);
        if (success) {
            deletePipelineStage(stageId);
            toast({ title: "Stage Deleted", description: "The pipeline stage has been removed." });
        } else {
            toast({ title: "Error", description: "Failed to delete stage.", variant: "destructive" });
        }
    }

    const handleDeleteWorkflow = async (workflowId: string) => {
        const { success } = await deleteWorkflowFromDb(workflowId);
        if (success) {
            deleteWorkflow(workflowId);
            toast({ title: "Workflow Deleted", description: "The automation rule has been removed." });
        } else {
            toast({ title: "Error", description: "Failed to delete workflow.", variant: "destructive" });
        }
    }

    const handleWorkflowStatusChange = async (workflowId: string, newStatus: 'active' | 'inactive') => {
        const updatedWorkflowRule = await updateWorkflowStatus(workflowId, newStatus);
        if (updatedWorkflowRule) {
            updateWorkflow(updatedWorkflowRule);
            toast({ title: "Workflow Updated", description: `Workflow is now ${newStatus}.` });
        } else {
             toast({ title: "Error", description: "Failed to update workflow status.", variant: "destructive" });
        }
    }
    
    const handleDeleteUser = async (userId: string) => {
        const { success, message } = await deleteUserFromDb(userId);
        if (success) {
            deleteUser(userId);
            toast({ title: "User Deleted", description: "The user has been removed from the system." });
        } else {
             toast({ title: "Error", description: message || "Failed to delete user.", variant: "destructive" });
        }
    }

    const handleDeleteRoundRobinRule = async (ruleId: string) => {
        const { success } = await deleteRoundRobinRuleFromDb(ruleId);
        if (success) {
            deleteRoundRobinRule(ruleId);
            toast({ title: "Rule Deleted", description: "The assignment rule has been removed." });
        } else {
             toast({ title: "Error", description: "Failed to delete assignment rule.", variant: "destructive" });
        }
    }

    const getActionDisplayValue = (action: UpdateLeadFieldAction) => {
        if (action.field === 'assignedToId') {
            return allUsers.find(u => u.id === action.value)?.name || action.value;
        }
        return action.value;
    }

    const renderCondition = (condition: WorkflowCondition) => {
        const fieldMap: Record<string, string> = {
            source: 'Source',
            inquiryType: 'Inquiry Type',
            status: 'Status',
            stage: 'Stage',
        }
        const operatorMap: Record<string, string> = {
            EQUALS: 'equals',
            NOT_EQUALS: 'does not equal'
        }
        return (
            <div key={condition.id} className="text-xs space-x-1">
                <span>If</span>
                <Badge variant="outline">{fieldMap[condition.field]}</Badge>
                <span>{operatorMap[condition.operator]}</span>
                <Badge variant="secondary">{condition.value}</Badge>
            </div>
        )
    }

    const renderActionDetails = (action: WorkflowAction) => {
        switch(action.type) {
            case 'CREATE_TASK':
                return (
                     <>
                        <p className="mt-1 text-xs sm:text-sm">Create a new task</p>
                        <code className="mt-2 text-xs bg-muted text-muted-foreground rounded px-2 py-1 block truncate">"{action.template}"</code>
                    </>
                );
            case 'UPDATE_LEAD_FIELD':
                 return (
                    <>
                        <p className="mt-1 text-xs sm:text-sm">Update lead field</p>
                        <div className="mt-2 text-xs space-x-1">
                            <span>Set</span>
                            <Badge variant="outline">{action.field === 'assignedToId' ? 'Assigned To' : 'Status'}</Badge>
                            <span>to</span>
                            <Badge variant="secondary">{getActionDisplayValue(action)}</Badge>
                        </div>
                    </>
                );
            case 'ADD_TAG':
                 return (
                    <>
                         <p className="mt-1 text-xs sm:text-sm">Add a tag</p>
                        <Badge variant="outline" className="mt-2"><Tag className="mr-1 h-3 w-3" /> {action.tag}</Badge>
                    </>
                );
            case 'ADD_NOTE':
                return (
                    <>
                        <p className="mt-1 text-xs sm:text-sm">Add a new note</p>
                        <code className="mt-2 text-xs bg-muted text-muted-foreground rounded px-2 py-1 block truncate">"{action.template}"</code>
                    </>
                );
            case 'SEND_EMAIL':
                return (
                    <>
                        <p className="mt-1 text-xs sm:text-sm flex items-center justify-center gap-2"><Mail className="h-4 w-4" /> Send an Email</p>
                        <div className="mt-2 text-xs space-y-1 text-left">
                            <div className="flex">
                                <span className="font-semibold w-12 shrink-0">To:</span>
                                <code className="bg-muted text-muted-foreground rounded px-2 py-1 block truncate">"{action.recipient}"</code>
                            </div>
                            <div className="flex">
                                <span className="font-semibold w-12 shrink-0">Body:</span>
                                <code className="bg-muted text-muted-foreground rounded px-2 py-1 block truncate">"{action.template}"</code>
                            </div>
                        </div>
                    </>
                );
            case 'SEND_WHATSAPP':
                 return (
                    <>
                        <p className="mt-1 text-xs sm:text-sm flex items-center justify-center gap-2"><MessageSquare className="h-4 w-4" /> Send WhatsApp</p>
                        <div className="mt-2 text-xs space-y-1 text-left">
                             <div className="flex">
                                <span className="font-semibold w-12 shrink-0">To:</span>
                                <code className="bg-muted text-muted-foreground rounded px-2 py-1 block truncate">"{action.recipient}"</code>
                            </div>
                            <div className="flex">
                                <span className="font-semibold w-12 shrink-0">Msg:</span>
                                <code className="bg-muted text-muted-foreground rounded px-2 py-1 block truncate">"{action.template}"</code>
                            </div>
                        </div>
                    </>
                );
            default:
                return null;
        }
    }


    return (
        <Tabs defaultValue="fields">
            <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="fields">Custom Fields</TabsTrigger>
                <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
                <TabsTrigger value="workflows">Workflows</TabsTrigger>
                <TabsTrigger value="users">Users &amp; Roles</TabsTrigger>
                <TabsTrigger value="assignment">Lead Assignment</TabsTrigger>
            </TabsList>

            <TabsContent value="fields" className="mt-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Custom Lead Fields</CardTitle>
                            <CardDescription>Create and manage your own fields for lead forms.</CardDescription>
                        </div>
                        <AddCustomFieldDialog>
                            <Button variant="outline"><PlusCircle className="mr-2 h-4 w-4" /> Add Field</Button>
                        </AddCustomFieldDialog>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border">
                            {fieldTree.length === 0 ? (
                                <div className="text-center p-8 text-muted-foreground">No custom fields created yet.</div>
                            ) : (
                                fieldTree.map((field) => (
                                    <CustomFieldItem key={field.id} field={field} onFieldDelete={handleDeleteField} />
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
                        <AddStageDialog>
                            <Button variant="outline"><PlusCircle className="mr-2 h-4 w-4" /> Add Stage</Button>
                        </AddStageDialog>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border">
                            {pipelineStages.length === 0 ? (
                                <div className="text-center p-8 text-muted-foreground">No pipeline stages defined yet.</div>
                            ) : (
                                pipelineStages.map((stage, index) => (
                                    <div key={stage.id} className={`flex items-center justify-between p-4 ${index < pipelineStages.length - 1 ? 'border-b' : ''}`}>
                                        <p className="font-medium">{stage.name}</p>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                    <Trash2 className="h-4 w-4 text-destructive" /><span className="sr-only">Delete {stage.name}</span>
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        This will permanently delete the "{stage.name}" stage. This action cannot be undone.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleDeleteStage(stage.id)} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">Delete</AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
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
                        <AddWorkflowDialog>
                            <Button variant="outline"><PlusCircle className="mr-2 h-4 w-4" /> Add Workflow</Button>
                        </AddWorkflowDialog>
                    </CardHeader>
                    <CardContent>
                         <div className="space-y-4">
                            {workflows.length === 0 ? (
                                <div className="text-center p-8 text-muted-foreground rounded-md border">No workflows created yet.</div>
                            ) : (
                                workflows.map((rule) => (
                                    <div key={rule.id} className="rounded-lg border bg-card p-4 space-y-3">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center gap-3">
                                                <Workflow className="h-5 w-5 text-primary mt-1" />
                                                <div>
                                                    <h4 className="font-semibold">{rule.name}</h4>
                                                    <div className="flex items-center gap-2">
                                                        <Switch
                                                            id={`workflow-status-${rule.id}`}
                                                            checked={rule.status === 'active'}
                                                            onCheckedChange={(checked) => handleWorkflowStatusChange(rule.id, checked ? 'active' : 'inactive')}
                                                        />
                                                        <Badge variant={rule.status === 'active' ? 'default' : 'secondary'}>
                                                            {rule.status === 'active' ? 'Active' : 'Inactive'}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            </div>
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button variant="ghost" size="icon">
                                                        <Trash2 className="h-4 w-4 text-destructive" /><span className="sr-only">Delete {rule.name}</span>
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                        <AlertDialogDescription>This will permanently delete the "{rule.name}" workflow. This action cannot be undone.</AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                        <AlertDialogAction onClick={() => handleDeleteWorkflow(rule.id)} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">Delete</AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </div>

                                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-center gap-2 sm:gap-4 text-sm text-muted-foreground">
                                            <div className="flex-1 rounded-md border p-3 text-center bg-background w-full">
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

                                            {rule.conditions && rule.conditions.length > 0 && (
                                                <>
                                                    <ArrowRight className="h-6 w-6 shrink-0 text-muted-foreground hidden sm:block" />
                                                    <div className="flex-1 rounded-md border p-3 text-center bg-background space-y-2 w-full">
                                                        <p className="font-medium text-foreground flex items-center justify-center gap-2">IF <Filter className="h-4 w-4" /></p>
                                                        {rule.conditions.map(renderCondition)}
                                                    </div>
                                                </>
                                            )}
                                            
                                            <ArrowRight className="h-6 w-6 shrink-0 text-muted-foreground hidden sm:block" />

                                            <div className="flex-1 rounded-md border p-3 text-center bg-background w-full">
                                                <p className="font-medium text-foreground">THEN</p>
                                                {renderActionDetails(rule.action)}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="users" className="mt-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Users &amp; Roles</CardTitle>
                            <CardDescription>Manage your team members and their access levels.</CardDescription>
                        </div>
                         <InviteUserDialog>
                            <Button variant="outline"><UserPlus className="mr-2 h-4 w-4" /> Invite User</Button>
                        </InviteUserDialog>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border">
                            {allUsers.length === 0 ? (
                                <div className="text-center p-8 text-muted-foreground">No users found.</div>
                            ) : (
                                allUsers.map((user, index) => (
                                    <div key={user.id} className={`flex items-center justify-between p-4 ${index < allUsers.length - 1 ? 'border-b' : ''}`}>
                                        <div className="flex items-center gap-4">
                                            <Avatar>
                                                <AvatarImage src={user.avatarUrl} alt={user.name} data-ai-hint="person face"/>
                                                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="font-medium">{user.name}</p>
                                                <p className="text-sm text-muted-foreground">{user.email}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Badge variant="secondary">{user.role}</Badge>
                                            <EditUserDialog user={user}>
                                                <Button variant="ghost" size="icon" disabled={['user-2', 'user-ai'].includes(user.id)}>
                                                    <Edit className="h-4 w-4" /><span className="sr-only">Edit {user.name}</span>
                                                </Button>
                                            </EditUserDialog>
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button variant="ghost" size="icon" disabled={['user-2', 'user-ai'].includes(user.id)}>
                                                        <Trash2 className="h-4 w-4 text-destructive" /><span className="sr-only">Delete {user.name}</span>
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        This action cannot be undone. This will permanently delete the user account
                                                        for {user.name}.
                                                    </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleDeleteUser(user.id)} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">Delete</AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="assignment" className="mt-6">
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Round Robin Assignment</CardTitle>
                            <CardDescription>Automatically distribute new leads from a source to multiple users.</CardDescription>
                        </div>
                        <AddRoundRobinRuleDialog>
                             <Button variant="outline"><PlusCircle className="mr-2 h-4 w-4" /> Add Rule</Button>
                        </AddRoundRobinRuleDialog>
                    </CardHeader>
                    <CardContent>
                       <div className="rounded-md border">
                            {roundRobinRules.length === 0 ? (
                                <div className="text-center p-8 text-muted-foreground">No assignment rules created yet.</div>
                            ) : (
                                roundRobinRules.map((rule, index) => (
                                    <div key={rule.id} className={`flex items-center justify-between p-4 ${index < roundRobinRules.length - 1 ? 'border-b' : ''}`}>
                                        <div>
                                            <p className="font-medium">{rule.name}</p>
                                            <p className="text-sm text-muted-foreground">Source: <Badge variant="secondary">{rule.source}</Badge></p>
                                            <div className="flex items-center gap-2 mt-2">
                                                <span className="text-sm text-muted-foreground">Users:</span>
                                                 <div className="flex items-center gap-4">
                                                    {rule.assignments && rule.assignments.map(assignment => {
                                                        const user = allUsers.find(u => u.id === assignment.userId);
                                                        return user ? (
                                                            <TooltipProvider key={assignment.userId}>
                                                                <Tooltip>
                                                                    <TooltipTrigger asChild>
                                                                        <div className="relative">
                                                                            <Avatar className="h-6 w-6">
                                                                                <AvatarImage src={user.avatarUrl} alt={user.name} data-ai-hint="person face" />
                                                                                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                                                                            </Avatar>
                                                                            <Badge variant="secondary" className="absolute -right-2 -bottom-1 h-4 px-1 text-xs rounded-full">
                                                                                {assignment.weight}
                                                                            </Badge>
                                                                        </div>
                                                                    </TooltipTrigger>
                                                                    <TooltipContent>
                                                                        <p>{user.name} (Weight: {assignment.weight})</p>
                                                                    </TooltipContent>
                                                                </Tooltip>
                                                            </TooltipProvider>
                                                        ) : null;
                                                    })}
                                                </div>
                                            </div>
                                        </div>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                    <Trash2 className="h-4 w-4 text-destructive" /><span className="sr-only">Delete {rule.name}</span>
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                    <AlertDialogDescription>This will permanently delete the "{rule.name}" assignment rule. This action cannot be undone.</AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleDeleteRoundRobinRule(rule.id)} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">Delete</AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                 </Card>
            </TabsContent>
        </Tabs>
    )
}
