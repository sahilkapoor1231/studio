'use client'

import { useState } from "react"
import { useForm } from "react-hook-form"
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { PipelineStage, WorkflowRule, WorkflowTriggerType, WorkflowAction, User } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import { addWorkflow } from "@/lib/data"

const baseSchema = z.object({
  name: z.string().min(3, { message: "Workflow name must be at least 3 characters." }),
  triggerType: z.custom<WorkflowTriggerType>(),
  triggerValue: z.string().optional(),
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
    },
  })

  const triggerType = form.watch('triggerType');
  const actionType = form.watch('actionType');
  const actionField = form.watch('actionField');

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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Workflow</DialogTitle>
          <DialogDescription>
            Automate actions based on triggers in your CRM.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                                <FormLabel>Task Title</FormLabel>
                                <FormControl><Input {...field} /></FormControl>
                                <FormDescription>Placeholders: {'{{lead.name}}'}, {'{{lead.inquiryType}}'}</FormDescription>
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
                                <FormLabel>Note Content</FormLabel>
                                <FormControl><Input {...field} /></FormControl>
                                <FormDescription>Placeholders: {'{{lead.name}}'}, {'{{lead.inquiryType}}'}</FormDescription>
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

            <DialogFooter>
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
