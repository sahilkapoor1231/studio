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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { updateLeadAssignment } from "@/lib/data"
import type { Lead } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import { useAppContext } from "@/lib/app-context"

const formSchema = z.object({
  assignedToId: z.string({ required_error: "Please select a team member." }),
});

type ReassignLeadFormValues = z.infer<typeof formSchema>;

export function ReassignLeadDialog({ children, lead, onLeadUpdated }: { children: React.ReactNode, lead: Lead, onLeadUpdated: (lead: Lead) => void }) {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast()
  const { assignableUsers } = useAppContext();

  const form = useForm<ReassignLeadFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      assignedToId: lead.assignedTo.id,
    },
  })

  // Reset form when dialog opens
  useState(() => {
    if (open) {
      form.reset({ assignedToId: lead.assignedTo.id });
    }
  })

  async function onSubmit(values: ReassignLeadFormValues) {
    setIsSubmitting(true);
    try {
        const updatedLead = await updateLeadAssignment(lead.id, values.assignedToId);
        const assignedUser = assignableUsers.find(u => u.id === values.assignedToId);
        
        onLeadUpdated(updatedLead);
        toast({
            title: "Lead Reassigned",
            description: `${lead.name} has been assigned to ${assignedUser?.name}.`,
        })
        setOpen(false)
    } catch (error) {
        console.error("Failed to reassign lead:", error);
        toast({
            title: "Error",
            description: "Could not reassign lead. Please try again.",
            variant: "destructive"
        });
    } finally {
        setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Reassign Lead</DialogTitle>
          <DialogDescription>
            Assign {lead.name} to a different team member.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
                control={form.control}
                name="assignedToId"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Assign To</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a team member" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                {assignableUsers.map(user => <SelectItem key={user.id} value={user.id}>{user.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                )}
            />
            
            <DialogFooter>
                <DialogClose asChild>
                    <Button type="button" variant="secondary">Cancel</Button>
                </DialogClose>
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Reassigning...' : 'Reassign Lead'}
                </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
