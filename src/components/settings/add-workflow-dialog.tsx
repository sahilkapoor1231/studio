'use client'

import { useState } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { PipelineStage, WorkflowRule, WorkflowTriggerType, WorkflowAction, User, WorkflowCondition, WorkflowConditionField, WorkflowConditionOperator, LeadStage } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import { addWorkflow } from "@/lib/data"
import { Textarea } from "@/components/ui/textarea"
import { HelpCircle, PlusCircle, Trash2 } from "lucide-react"

function PlaceholderHelpDialog() {
    return (
         <Dialog>
            <DialogTrigger asChild>
                <HelpCircle className="h-4 w-4 cursor-pointer text-muted-foreground hover:text-foreground" />
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Using Dynamic Placeholders in Workflows</DialogTitle>
                    <DialogDescription>
                        You can make your automated actions dynamic by inserting placeholders. These will be replaced with the lead's actual information when the workflow runs.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 text-sm max-h-[60vh] overflow-y-auto pr-4">
                    <div>
                        <h4 className="font-semibold mb-2">Available Placeholders</h4>
                        <ul className="list-none space-y-2 text-muted-foreground bg-muted/50 p-3 rounded-md border">
                            <li><code className="text-foreground font-mono bg-background p-1 rounded">{'{{lead.name}}'}</code> - The full name of the lead.</li>
                            <li><code className="text-foreground font-mono bg-background p-1 rounded">{'{{lead.email}}'}</code> - The lead's email address.</li>
                            <li><code className="text-foreground font-mono bg-background p-1 rounded">{'{{lead.phone}}'}</code> - The lead's phone number.</li>
                            <li><code className="text-foreground font-mono bg-background p-1 rounded">{'{{lead.source}}'}</code> - Where the lead came from.</li>
                            <li><code className="text-foreground font-mono bg-background p-1 rounded">{'{{lead.inquiryType}}'}</code> - The type of inquiry.</li>
                             <li><code className="text-foreground font-mono bg-background p-1 rounded">{'{{lead.status}}'}</code> - The lead's current status/pipeline stage.</li>
                             <li><code className="text-foreground font-mono bg-background p-1 rounded">{'{{lead.stage}}'}</code> - The lead's current sub-stage.</li>
                            <li><code className="text-foreground font-mono bg-background p-1 rounded">{'{{lead.assignedTo.name}}'}</code> - Name of the assigned team member.</li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold mb-2">Example: Creating a Task</h4>
                        <div className="p-3 rounded-md border space-y-2">
                             <p className="text-muted-foreground">
                                <strong>Template:</strong>
                            </p>
                             <pre className="text-xs bg-muted p-2 rounded-md">Follow up with {'{{lead.name}}'} about their {'{{inquiryType}}'} inquiry.</pre>
                             <p className="text-muted-foreground">
                                <strong>Result (for a lead named John Doe):</strong>
                            </p>
                             <pre className="text-xs bg-muted p-2 rounded-md">Follow up with John Doe about their IVF Journey inquiry.</pre>
                        </div>
                    </div>

                     <div>
                        <h4 className="font-semibold mb-2">Example: Adding a Note</h4>
                         <div className="p-3 rounded-md border space-y-2">
                             <p className="text-muted-foreground">
                                <strong>Template:</strong>
                            </p>
                             <pre className="text-xs bg-muted p-2 rounded-md">Automated log: New lead from {'{{lead.source}}'} assigned to {'{{lead.assignedTo.name}}'}. Contact: {'{{lead.email}}'}.</pre>
                             <p className="text-muted-foreground">
                                <strong>Result (for a lead from 'Facebook Ad'):</strong>
                            </p>
                             <pre className="text-xs bg-muted p-2 rounded-md">Automated log: New lead from Facebook Ad assigned to Alex Carter. Contact: john.doe@example.com.</pre>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}

const conditionSchema = z.object({
  id: z.string().optional(),
  field: z.custom<WorkflowConditionField>(),
  operator: z.custom<WorkflowConditionOperator>(),
  value: z.string().min(1, "Value is required"),
});

const baseSchema = z.object({
  name: z.string().min(3, { message: "Workflow name must be at least 3 characters." }),
  triggerType: z.custom<WorkflowTriggerType>(),
  triggerValue: z.string().optional(),
  conditions: z.array(conditionSchema),
})

const formSchema = z.discriminatedUnion("actionType", [
    z.object({
        actionType: z.literal("CREATE_TASK"),
        actionTemplate: z.string().min(3, { message: "Task title is required." }),
    }),
    z.object({
        actionType: z.literal("UPDATE_LEAD_FIELD"),
        actionField: z.enum(["status", "assignedToId"]),
        actionValue: z.string({ required_error: "Please select a value." }).min(1, { message: "Please select a value." }),
    }),
    z.object({
        actionType: z.literal("ADD_TAG"),
        actionTag: z.string().min(2, { message: "Tag is required" }),
    }),
    z.object({
        actionType: z.literal("ADD_NOTE"),
        actionTemplate: z.string().min(3, { message: "Note template is required." }),
    }),
]).and(baseSchema)
.refine(data => {
    if (data.triggerType === 'LEAD_STATUS_CHANGED') {
        return !!data.triggerValue;
    }
    return true;
}, {
    message: "Please select a trigger status.",
    path: ["triggerValue"],
});

type AddWorkflowFormValues = z.infer<typeof formSchema>

const leadSources = ['Website Form', 'Facebook Ad', 'Walk-in', 'IVR', 'WhatsApp'] as const;
const inquiryTypes = ['General OPD', 'IVF Journey', 'Surgery Consultation'] as const;
const leadStages: LeadStage[] = ['Initial Inquiry', 'Consultation Done', 'Procedure Booked', 'Follow-up Required'];

export function AddWorkflowDialog({ children, onWorkflowAdded, pipelineStages, users }: { children: React.ReactNode, onWorkflowAdded: (newWorkflow: WorkflowRule) => void, pipelineStages: PipelineStage[], users: User[] }) {
  const [open, setOpen] = useState(false)
  const { toast } = useToast()

  const form = useForm<AddWorkflowFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      triggerType: "LEAD_STATUS_CHANGED",
      triggerValue: "",
      actionType: "CREATE_TASK",
      actionTemplate: "Follow up with {{lead.name}}",
      conditions: [],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "conditions",
  });

  const triggerType = form.watch('triggerType');
  const actionType = form.watch('actionType');
  const actionField = form.watch('actionField');
  const conditions = form.watch('conditions');

  async function onSubmit(values: AddWorkflowFormValues) {
    try {
        let action: WorkflowAction;

        if (values.actionType === 'CREATE_TASK') {
            action = { type: 'CREATE_TASK', template: values.actionTemplate };
        } else if (values.actionType === 'UPDATE_LEAD_FIELD') {
            action = { type: 'UPDATE_LEAD_FIELD', field: values.actionField, value: values.actionValue };
        } else if (values.actionType === 'ADD_TAG') {
             action = { type: 'ADD_TAG', tag: values.actionTag };
        } else {
             action = { type: 'ADD_NOTE', template: values.actionTemplate };
        }

        const workflowData: Omit<WorkflowRule, 'id'> = {
            name: values.name,
            trigger: { type: values.triggerType },
            conditions: values.conditions.map(c => ({...c, id: `cond-${Date.now()}`})),
            action: action
        }
        if (values.triggerType === 'LEAD_STATUS_CHANGED') {
            workflowData.trigger.value = values.triggerValue;
        }

        const newWorkflow = await addWorkflow(workflowData);
        onWorkflowAdded(newWorkflow);
        toast({
            title: "Workflow Created",
            description: `The automation rule "${newWorkflow.name}" has been added.`,
        })
        setOpen(false)
        form.reset()
    } catch (error) {
        toast({
            title: "Error",
            description: "Could not create the workflow.",
            variant: "destructive"
        })
    }
  }
  
  const getConditionValueOptions = (field: WorkflowConditionField) => {
    switch (field) {
      case 'source':
        return leadSources;
      case 'inquiryType':
        return inquiryTypes;
      case 'status':
        return pipelineStages.map(s => s.name);
      case 'stage':
        return leadStages;
      default:
        return [];
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add New Workflow</DialogTitle>
          <DialogDescription>
            Automate actions based on triggers and conditions in your CRM.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-h-[70vh] overflow-y-auto pr-6 pl-1">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Workflow Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Converted Lead Follow-up" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="rounded-md border p-4 space-y-4">
                <h4 className="font-semibold text-sm">Trigger (WHEN)</h4>
                 <FormField
                    control={form.control}
                    name="triggerType"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>When...</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a trigger event" />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="LEAD_CREATED">A new lead is created</SelectItem>
                                <SelectItem value="LEAD_STATUS_CHANGED">Lead status changes</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                {triggerType === 'LEAD_STATUS_CHANGED' && (
                    <FormField
                        control={form.control}
                        name="triggerValue"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>To status...</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a status" />
                                    </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                    {pipelineStages.map(stage => <SelectItem key={stage.id} value={stage.name}>{stage.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                )}
            </div>

            <div className="rounded-md border p-4 space-y-4">
                <h4 className="font-semibold text-sm">Conditions (IF)</h4>
                {fields.map((item, index) => (
                    <div key={item.id} className="flex items-end gap-2 p-2 border rounded-md bg-background">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 flex-1">
                             <FormField
                                control={form.control}
                                name={`conditions.${index}.field`}
                                render={({ field }) => (
                                    <FormItem><FormLabel>Field</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Field" /></SelectTrigger></FormControl><SelectContent><SelectItem value="source">Source</SelectItem><SelectItem value="inquiryType">Inquiry Type</SelectItem><SelectItem value="status">Status</SelectItem><SelectItem value="stage">Stage</SelectItem></SelectContent></Select><FormMessage /></FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name={`conditions.${index}.operator`}
                                render={({ field }) => (
                                    <FormItem><FormLabel>Operator</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Operator" /></SelectTrigger></FormControl><SelectContent><SelectItem value="EQUALS">Equals</SelectItem><SelectItem value="NOT_EQUALS">Not Equals</SelectItem></SelectContent></Select><FormMessage /></FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name={`conditions.${index}.value`}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Value</FormLabel>
                                         <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Value" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {getConditionValueOptions(conditions[index]?.field).map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                    </div>
                ))}
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => append({ field: 'source', operator: 'EQUALS', value: '' })}
                >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Condition
                </Button>
            </div>
            
            <div className="rounded-md border p-4 space-y-4">
                <h4 className="font-semibold text-sm">Action (THEN)</h4>
                 <FormField
                    control={form.control}
                    name="actionType"
                    render={({ field }) => (
                        <FormItem><FormLabel>Action</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select an action" /></SelectTrigger></FormControl><SelectContent><SelectItem value="CREATE_TASK">Create Task</SelectItem><SelectItem value="UPDATE_LEAD_FIELD">Update Lead Field</SelectItem><SelectItem value="ADD_TAG">Add Tag</SelectItem><SelectItem value="ADD_NOTE">Add Note</SelectItem></SelectContent></Select><FormMessage /></FormItem>
                    )}
                />

                {actionType === 'CREATE_TASK' && (
                     <FormField
                        control={form.control}
                        name="actionTemplate"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="flex items-center gap-2">
                                    Task Title
                                    <PlaceholderHelpDialog />
                                </FormLabel>
                                <FormControl><Input placeholder="e.g. Follow up with {{lead.name}}" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                )}

                {actionType === 'ADD_NOTE' && (
                     <FormField
                        control={form.control}
                        name="actionTemplate"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="flex items-center gap-2">
                                    Note Content
                                    <PlaceholderHelpDialog />
                                </FormLabel>
                                <FormControl>
                                  <Textarea 
                                      placeholder="e.g., AI analysis initiated for {{lead.name}}."
                                      {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                )}

                {actionType === 'UPDATE_LEAD_FIELD' && (
                    <>
                        <FormField
                            control={form.control}
                            name="actionField"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Field to Update</FormLabel>
                                <Select onValueChange={(value) => { field.onChange(value); form.setValue('actionValue', '') }} defaultValue={field.value}>
                                    <FormControl><SelectTrigger><SelectValue placeholder="Select a field" /></SelectTrigger></FormControl>
                                    <SelectContent>
                                        <SelectItem value="status">Status</SelectItem>
                                        <SelectItem value="assignedToId">Assigned To</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        {actionField && (
                             <FormField
                                control={form.control}
                                name="actionValue"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Set To</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select a value" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                            {actionField === 'status' && pipelineStages.map(stage => <SelectItem key={stage.id} value={stage.name}>{stage.name}</SelectItem>)}
                                            {actionField === 'assignedToId' && users.map(user => <SelectItem key={user.id} value={user.id}>{user.name}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}
                    </>
                )}
                {actionType === 'ADD_TAG' && (
                     <FormField
                        control={form.control}
                        name="actionTag"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Tag to Add</FormLabel>
                                <FormControl><Input placeholder="e.g., High Priority" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                )}
            </div>

            <DialogFooter className="pr-1 sticky bottom-0 bg-card-foreground/5 py-4 backdrop-blur-sm">
                <DialogClose asChild>
                    <Button type="button" variant="secondary">Cancel</Button>
                </DialogClose>
                <Button type="submit">Create Workflow</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
