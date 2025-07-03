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
import { bulkRestoreAndReassignLeads } from "@/lib/data"
import { useToast } from "@/hooks/use-toast"
import { useAppContext } from "@/lib/app-context"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

const formSchema = z.object({
  assignedToId: z.string({ required_error: "Please select a team member." }),
});

type FormValues = z.infer<typeof formSchema>;

export function BulkRestoreDialog({
    children,
    leadIds,
    onComplete
}: {
    children: React.ReactNode
    leadIds: string[]
    onComplete: () => void
}) {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast()
  const router = useRouter();
  const { assignableUsers } = useAppContext();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
        assignedToId: undefined,
    },
  })

  async function onSubmit(values: FormValues) {
    setIsSubmitting(true);
    try {
        await bulkRestoreAndReassignLeads(leadIds, values.assignedToId);
        const assignedUser = assignableUsers.find(u => u.id === values.assignedToId);
        
        toast({
            title: "Leads Restored",
            description: `${leadIds.length} leads have been restored and reassigned to ${assignedUser?.name}.`,
        })
        onComplete();
        setOpen(false)
        router.refresh();
    } catch (error) {
        console.error("Failed to bulk restore leads:", error);
        toast({
            title: "Error",
            description: "Could not restore leads. Please try again.",
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
          <DialogTitle>Bulk Restore & Reassign</DialogTitle>
          <DialogDescription>
            Restore {leadIds.length} selected leads and assign them to a team member.
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
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isSubmitting ? 'Restoring...' : 'Restore Leads'}
                </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
