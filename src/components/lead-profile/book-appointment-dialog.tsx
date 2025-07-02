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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { addTask, updateLeadStatus, getTasks, updateTaskStatus } from "@/lib/data"
import type { Lead, Task } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import { format, formatISO, set, startOfToday } from "date-fns"
import { CalendarIcon, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"

const formSchema = z.object({
  appointmentDate: z.date({ required_error: "An appointment date is required." }),
  appointmentTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:MM)"),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function BookAppointmentDialog({ children, lead, isRescheduling }: { children: React.ReactNode, lead: Lead, isRescheduling?: boolean }) {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast()
  const router = useRouter();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
        appointmentTime: '10:00',
        notes: '',
    },
  })

  async function onSubmit(values: FormValues) {
    setIsSubmitting(true);
    try {
        const [hours, minutes] = values.appointmentTime.split(':').map(Number);
        const combinedDueDate = set(values.appointmentDate, { hours, minutes });

        const taskData: Omit<Task, 'id' | 'status' | 'completedAt' | 'completedBy'> = {
            lead: { id: lead.id, name: lead.name, photoUrl: lead.photoUrl },
            title: `Appointment for ${lead.name}`,
            dueDate: formatISO(combinedDueDate),
            type: 'Appointment',
            assignedTo: lead.assignedTo
        }

        await addTask(taskData);
        // In a real app, the current user ID would come from an auth context
        const { updatedLead } = await updateLeadStatus(lead.id, 'Appointment Scheduled', 'user-2');

        if (!updatedLead) {
            throw new Error("Failed to update lead status");
        }

        // Resolve any overdue tasks for this lead
        const allTasks = await getTasks();
        const overdueTasksForLead = allTasks.filter(
            t => t.lead.id === lead.id && t.status === 'Overdue'
        );

        for (const task of overdueTasksForLead) {
            await updateTaskStatus(task.id, 'Done', 'user-2');
        }
        
        toast({
            title: isRescheduling ? "Appointment Rescheduled" : "Appointment Booked",
            description: `An appointment has been scheduled for ${lead.name}.`,
        })
        window.dispatchEvent(new CustomEvent('notifications-updated'));
        setOpen(false)
        router.refresh();
    } catch (error) {
        console.error("Failed to book appointment:", error);
        toast({
            title: "Error",
            description: "Could not book appointment. Please try again.",
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
          <DialogTitle>{isRescheduling ? 'Reschedule' : 'Book'} Appointment</DialogTitle>
          <DialogDescription>
            {isRescheduling ? 'Update the appointment' : 'Schedule an appointment'} for {lead.name}.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
             <div className="grid grid-cols-2 gap-4">
                <FormField
                    control={form.control}
                    name="appointmentDate"
                    render={({ field }) => (
                        <FormItem className="flex flex-col">
                        <FormLabel>Date</FormLabel>
                        <Popover>
                            <PopoverTrigger asChild>
                            <FormControl>
                                <Button
                                variant={"outline"}
                                className={cn(
                                    "w-full pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                )}
                                >
                                {field.value ? (
                                    format(field.value, "PPP")
                                ) : (
                                    <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                            </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) =>
                                    date < startOfToday()
                                }
                                initialFocus
                            />
                            </PopoverContent>
                        </Popover>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="appointmentTime"
                    render={({ field }) => (
                        <FormItem className="flex flex-col">
                        <FormLabel>Time</FormLabel>
                        <FormControl>
                            <Input type="time" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Any specific notes for this appointment..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
                <DialogClose asChild>
                    <Button type="button" variant="secondary">Cancel</Button>
                </DialogClose>
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Booking...' : (isRescheduling ? 'Reschedule' : 'Book Appointment')}
                </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
