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
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getUsers } from "@/lib/data"
import type { Lead, User, LeadStatus } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import { Separator } from "./ui/separator"

const leadSources = ['Website Form', 'Facebook Ad', 'Walk-in', 'IVR', 'WhatsApp'] as const;
const leadStatuses: LeadStatus[] = ['New', 'Contacted', 'Qualified', 'Appointment Scheduled', 'No Go', 'Converted'];
const inquiryTypes = ['General OPD', 'IVF Journey', 'Surgery Consultation'] as const;

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Invalid email address." }),
  phone: z.string().min(10, { message: "Phone number is too short." }),
  source: z.enum(leadSources),
  assignedToId: z.string({ required_error: "Please assign this lead." }),
  status: z.enum(leadStatuses),
  inquiryType: z.enum(inquiryTypes),
  photoUrl: z.string().url().optional(),
  // Custom Fields
  dateOfBirth: z.string().optional(),
  spouseName: z.string().optional(),
})

type AddLeadFormValues = z.infer<typeof formSchema>

export function AddLeadDialog({ children, onLeadAdded, defaultStatus }: { children: React.ReactNode, onLeadAdded?: (newLead: Lead) => void, defaultStatus?: LeadStatus }) {
  const [open, setOpen] = useState(false)
  const [users, setUsers] = useState<User[]>([])
  const { toast } = useToast()

  const form = useForm<AddLeadFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      source: "Website Form",
      status: defaultStatus || "New",
      inquiryType: "General OPD",
      dateOfBirth: "",
      spouseName: "",
    },
  })

  useEffect(() => {
    async function fetchUsers() {
      const fetchedUsers = await getUsers()
      setUsers(fetchedUsers.filter(u => u.role === 'Counselor' || u.role === 'Receptionist'))
    }
    if (open) {
      fetchUsers()
      form.reset({
        name: "",
        email: "",
        phone: "",
        source: "Website Form",
        status: defaultStatus || "New",
        inquiryType: "General OPD",
        dateOfBirth: "",
        spouseName: "",
      });
    }
  }, [open, defaultStatus, form])

  async function onSubmit(values: AddLeadFormValues) {
    const assignedUser = users.find(u => u.id === values.assignedToId);
    if (!assignedUser) {
        toast({ title: "Error", description: "Could not find assigned user.", variant: "destructive" })
        return;
    }

    const customFields: Record<string, string> = {};
    if (values.dateOfBirth) customFields["Date of Birth"] = values.dateOfBirth;
    if (values.spouseName) customFields["Spouse's Name"] = values.spouseName;

    const newLead: Lead = {
        id: `lead-${Math.random().toString(36).substr(2, 9)}`,
        name: values.name,
        email: values.email,
        phone: values.phone,
        source: values.source,
        assignedTo: assignedUser,
        status: values.status,
        inquiryType: values.inquiryType,
        photoUrl: `https://placehold.co/100x100.png`,
        stage: 'Initial Inquiry',
        lastContacted: new Date().toISOString(),
        tags: [],
        history: [],
        notes: [],
        documents: [],
        customFields,
    };
    
    onLeadAdded?.(newLead);
    toast({
        title: "Lead Created",
        description: `${newLead.name} has been successfully added.`,
    })
    setOpen(false)
    form.reset()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Lead</DialogTitle>
          <DialogDescription>
            Fill in the details below to create a new lead.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-h-[70vh] overflow-y-auto pr-6 pl-1">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="john.doe@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl>
                    <Input placeholder="+1-202-555-0101" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
                control={form.control}
                name="source"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Source</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a source" />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                        {leadSources.map(source => <SelectItem key={source} value={source}>{source}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <FormMessage />
                    </FormItem>
                )}
            />
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
            <Separator />
            <div className="space-y-2">
                <h4 className="text-sm font-medium">Custom Fields</h4>
                <p className="text-xs text-muted-foreground">Add custom details for this lead.</p>
            </div>
             <FormField
              control={form.control}
              name="dateOfBirth"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date of Birth</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., 1990-01-01" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="spouseName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Spouse's Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Jane Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="pr-1">
                <DialogClose asChild>
                    <Button type="button" variant="secondary">Cancel</Button>
                </DialogClose>
                <Button type="submit">Create Lead</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
