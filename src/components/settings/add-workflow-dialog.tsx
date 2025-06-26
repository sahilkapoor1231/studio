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
import type { PipelineStage, WorkflowRule } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import { addWorkflow } from "@/lib/data"

const formSchema = z.object({
  name: z.string().min(3, { message: "Workflow name must be at least 3 characters." }),
  triggerValue: z.string({ required_error: "Please select a trigger status." }),
  actionTemplate: z.string().min(3, { message: "Task title is required." }),
})

type AddWorkflowFormValues = z.infer<typeof formSchema>

export function AddWorkflowDialog({ children, onWorkflowAdded, pipelineStages }: { children: React.ReactNode, onWorkflowAdded: (newWorkflow: WorkflowRule) => void, pipelineStages: PipelineStage[] }) {
  const [open, setOpen] = useState(false)
  const { toast } = useToast()

  const form = useForm<AddWorkflowFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      triggerValue: "",
      actionTemplate: "Follow up with {{lead.name}}",
    },
  })

  async function onSubmit(values: AddWorkflowFormValues) {
    try {
        const workflowData = {
            name: values.name,
            trigger: {
                type: 'LEAD_STATUS_CHANGED' as const,
                value: values.triggerValue
            },
            action: {
                type: 'CREATE_TASK' as const,
                template: values.actionTemplate,
            }
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
                <h4 className="font-semibold text-sm">Trigger</h4>
                <p className="text-sm text-muted-foreground -mt-2">When a lead's status is updated to...</p>
                <FormField
                    control={form.control}
                    name="triggerValue"
                    render={({ field }) => (
                        <FormItem>
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
            </div>
            
            <div className="rounded-md border p-4 space-y-4">
                 <h4 className="font-semibold text-sm">Action</h4>
                 <p className="text-sm text-muted-foreground -mt-2">Then, create a new task with the title...</p>
                <FormField
                    control={form.control}
                    name="actionTemplate"
                    render={({ field }) => (
                        <FormItem>
                        <FormControl>
                            <Input {...field} />
                        </FormControl>
                        <FormDescription>
                            You can use `{{lead.name}}` as a placeholder.
                        </FormDescription>
                        <FormMessage />
                        </FormItem>
                    )}
                />
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
