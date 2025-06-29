'use client'

import { useState, useEffect } from "react"
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
import { getUsers, restoreAndReassignLead } from "@/lib/data"
import type { Lead, User } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import { Skeleton } from "../ui/skeleton"

const formSchema = z.object({
  assignedToId: z.string({ required_error: "Please select a team member." }),
});

type FormValues = z.infer<typeof formSchema>;

export function RestoreReassignDialog({ children, lead, onLeadRestored }: { children: React.ReactNode, lead: Lead, onLeadRestored: (leadId: string) => void }) {
  const [open, setOpen] = useState(false)
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      assignedToId: lead.assignedTo.id,
    },
  })

  useEffect(() => {
    if (!open) return;

    async function fetchUsers() {
      setIsLoading(true);
      const fetchedUsers = await getUsers();
      setUsers(fetchedUsers.filter(u => u.role === 'Counselor' || u.role === 'Receptionist'));
      setIsLoading(false);
    }
    fetchUsers();
  }, [open])

  async function onSubmit(values: FormValues) {
    setIsSubmitting(true);
    try {
        await restoreAndReassignLead(lead.id, values.assignedToId);
        const assignedUser = users.find(u => u.id === values.assignedToId);
        
        onLeadRestored(lead.id);
        toast({
            title: "Lead Restored",
            description: `${lead.name} has been restored and assigned to ${assignedUser?.name}.`,
        })
        setOpen(false)
    } catch (error) {
        console.error("Failed to restore lead:", error);
        toast({
            title: "Error",
            description: "Could not restore lead. Please try again.",
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
          <DialogTitle>Restore & Reassign Lead</DialogTitle>
          <DialogDescription>
            This will restore "{lead.name}" to the active leads list and reassign it.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            { isLoading ? (
                <Skeleton className="h-10 w-full" />
            ) : (
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
                                    {users.map(user => <SelectItem key={user.id} value={user.id}>{user.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            )}
            
            <DialogFooter>
                <DialogClose asChild>
                    <Button type="button" variant="secondary">Cancel</Button>
                </DialogClose>
                <Button type="submit" disabled={isLoading || isSubmitting}>
                    {isSubmitting ? 'Restoring...' : 'Restore & Reassign'}
                </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
