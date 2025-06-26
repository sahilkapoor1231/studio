'use client'

import { useState, useEffect, useMemo } from "react"
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
import { getUsers, addLead, getCustomFields, getPipelineStages } from "@/lib/data"
import type { Lead, User, CustomFieldDefinition, CustomFieldType, PipelineStage, NewLeadPayload, LeadStage } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import { Separator } from "./ui/separator"
import { Skeleton } from "./ui/skeleton"

const leadSources = ['Website Form', 'Facebook Ad', 'Walk-in', 'IVR', 'WhatsApp'] as const;
const inquiryTypes = ['General OPD', 'IVF Journey', 'Surgery Consultation'] as const;

// Base schema for standard fields
const baseFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Invalid email address." }),
  phone: z.string().min(10, { message: "Phone number is too short." }),
  source: z.enum(leadSources),
  assignedToId: z.string({ required_error: "Please assign this lead." }),
  status: z.string({ required_error: "Please select a status." }),
  inquiryType: z.enum(inquiryTypes),
  photoUrl: z.string().url().optional(),
});

// Function to generate the Zod schema for custom fields
const generateCustomFieldsSchema = (customFields: CustomFieldDefinition[]) => {
    const shape: Record<string, z.ZodTypeAny> = {};
    customFields.forEach(field => {
        let fieldSchema: z.ZodTypeAny;

        switch (field.type) {
            case 'Number':
                fieldSchema = z.coerce.number({ invalid_type_error: "Must be a number" });
                break;
            case 'Date':
                fieldSchema = z.string().refine(val => val === '' || !isNaN(Date.parse(val)), {
                    message: "Please enter a valid date",
                });
                break;
            case 'Select':
                fieldSchema = z.string();
                break;
            default: // Text
                fieldSchema = z.string();
                break;
        }

        if (field.required) {
            if (field.type === 'Text' || field.type === 'Select') {
                fieldSchema = fieldSchema.min(1, `${field.label} is required.`);
            } else if (field.type === 'Date') {
                 fieldSchema = fieldSchema.refine(val => val !== '', `${field.label} is required.`);
            }
        } else {
            fieldSchema = fieldSchema.optional();
        }
        
        shape[field.id] = fieldSchema;
    });
    return z.object(shape);
};


export function AddLeadDialog({ children, onLeadAdded, defaultStatus }: { children: React.ReactNode, onLeadAdded?: (newLead: Lead) => void, defaultStatus?: string }) {
  const [open, setOpen] = useState(false)
  const [users, setUsers] = useState<User[]>([])
  const [customFields, setCustomFields] = useState<CustomFieldDefinition[]>([]);
  const [pipelineStages, setPipelineStages] = useState<PipelineStage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast()

  const finalSchema = useMemo(() => {
    return baseFormSchema.extend({
      customFields: generateCustomFieldsSchema(customFields)
    })
  }, [customFields]);

  type AddLeadFormValues = z.infer<typeof finalSchema>;

  const form = useForm<AddLeadFormValues>({
    resolver: zodResolver(finalSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      customFields: {},
    },
  })

  useEffect(() => {
    // Only fetch data when the dialog is opened
    if (!open) return;

    async function fetchData() {
      setIsLoading(true);
      const [fetchedUsers, fetchedCustomFields, fetchedStages] = await Promise.all([
        getUsers(),
        getCustomFields(),
        getPipelineStages()
      ]);
      setUsers(fetchedUsers.filter(u => u.role === 'Counselor' || u.role === 'Receptionist'));
      setCustomFields(fetchedCustomFields);
      setPipelineStages(fetchedStages);
      
      const defaultCustomValues: Record<string, any> = {};
      fetchedCustomFields.forEach(field => {
        defaultCustomValues[field.id] = field.type === 'Number' ? undefined : '';
      });

      // Reset the form with the latest data
      form.reset({
        name: "",
        email: "",
        phone: "",
        source: "Website Form",
        status: defaultStatus || fetchedStages[0]?.name,
        inquiryType: "General OPD",
        assignedToId: undefined,
        customFields: defaultCustomValues,
      });
      setIsLoading(false);
    }
    fetchData();
  }, [open, defaultStatus, form])

  async function onSubmit(values: AddLeadFormValues) {
    setIsSubmitting(true);
    try {
        const leadPayload: NewLeadPayload = {
            name: values.name,
            email: values.email,
            phone: values.phone,
            source: values.source,
            assignedToId: values.assignedToId,
            status: values.status,
            inquiryType: values.inquiryType,
            stage: 'Initial Inquiry' as LeadStage,
            customFields: values.customFields,
        };

        const newLead = await addLead(leadPayload);
        
        onLeadAdded?.(newLead);
        toast({
            title: "Lead Created",
            description: `${newLead.name} has been successfully added.`,
        })
        setOpen(false)
    } catch (error) {
        console.error("Failed to create lead:", error);
        toast({
            title: "Error",
            description: "Could not create lead. Please try again.",
            variant: "destructive"
        });
    } finally {
        setIsSubmitting(false);
    }
  }

  const renderCustomField = (fieldDef: CustomFieldDefinition) => {
    const getInputType = (type: CustomFieldType) => {
        switch(type) {
            case 'Number': return 'number';
            case 'Date': return 'date';
            default: return 'text';
        }
    }

    if (fieldDef.type === 'Select') {
        return (
            <FormField
                key={fieldDef.id}
                control={form.control}
                name={`customFields.${fieldDef.id}` as any}
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>{fieldDef.label}{fieldDef.required && ' *'}</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder={`Select a ${fieldDef.label}`} />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                {fieldDef.options?.map(option => (
                                    <SelectItem key={option} value={option}>{option}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                )}
            />
        )
    }

    return (
        <FormField
            key={fieldDef.id}
            control={form.control}
            name={`customFields.${fieldDef.id}` as any}
            render={({ field }) => (
                <FormItem>
                    <FormLabel>{fieldDef.label}{fieldDef.required && ' *'}</FormLabel>
                    <FormControl>
                        <Input 
                            type={getInputType(fieldDef.type)} 
                            {...field} 
                            value={field.value ?? ''}
                        />
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )}
        />
    )
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
            { isLoading ? (
                <div className="space-y-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                </div>
            ) : (
                <>
                    <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input placeholder="John Doe" {...field} /></FormControl><FormMessage /></FormItem>
                    )}
                    />
                    <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem><FormLabel>Email</FormLabel><FormControl><Input placeholder="john.doe@example.com" {...field} /></FormControl><FormMessage /></FormItem>
                    )}
                    />
                    <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                        <FormItem><FormLabel>Phone</FormLabel><FormControl><Input placeholder="+1-202-555-0101" {...field} /></FormControl><FormMessage /></FormItem>
                    )}
                    />
                     <FormField
                        control={form.control}
                        name="status"
                        render={({ field }) => (
                            <FormItem><FormLabel>Status</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select a status" /></SelectTrigger></FormControl><SelectContent>{pipelineStages.map(stage => <SelectItem key={stage.id} value={stage.name}>{stage.name}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="source"
                        render={({ field }) => (
                            <FormItem><FormLabel>Source</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select a source" /></SelectTrigger></FormControl><SelectContent>{leadSources.map(source => <SelectItem key={source} value={source}>{source}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="assignedToId"
                        render={({ field }) => (
                            <FormItem><FormLabel>Assign To</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select a team member" /></SelectTrigger></FormControl><SelectContent>{users.map(user => <SelectItem key={user.id} value={user.id}>{user.name}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>
                        )}
                    />

                    {customFields.length > 0 && <Separator />}
                    {customFields.length > 0 && (
                        <div className="space-y-2">
                            <h4 className="text-sm font-medium">Additional Details</h4>
                        </div>
                    )}
                    {customFields.map(renderCustomField)}
                </>
            )}
            
            <DialogFooter className="pr-1 sticky bottom-0 bg-background py-4">
                <DialogClose asChild>
                    <Button type="button" variant="secondary">Cancel</Button>
                </DialogClose>
                <Button type="submit" disabled={isLoading || isSubmitting}>
                    {isSubmitting ? 'Creating...' : 'Create Lead'}
                </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
