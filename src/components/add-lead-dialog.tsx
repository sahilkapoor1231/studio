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
import { addLead, addNote, addHistoryItem } from "@/lib/data"
import { summarizeLead } from '@/ai/flows/summarize-lead-flow'
import type { Lead, CustomFieldDefinition, CustomFieldType, NewLeadPayload, LeadStage } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import { Separator } from "./ui/separator"
import { useAppContext } from "@/lib/app-context"

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

// Helper function to build a tree from a flat list of fields
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
                fieldMap.get(field.parentId)!.children.push(node);
            } else {
                tree.push(node);
            }
        }
    });
    return tree;
};


export function AddLeadDialog({ children, onLeadAdded, defaultStatus }: { children: React.ReactNode, onLeadAdded?: (newLead: Lead) => void, defaultStatus?: string }) {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast()
  
  // Get shared data from context instead of fetching it
  const { assignableUsers, customFields, pipelineStages } = useAppContext();

  const finalSchema = useMemo(() => {
    return baseFormSchema.extend({
      customFields: generateCustomFieldsSchema(customFields)
    })
  }, [customFields]);

  const customFieldTree = useMemo(() => buildFieldTree(customFields), [customFields]);

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

  // Reset form with default values when dialog opens
  useEffect(() => {
    if (!open) return;
      
    const defaultCustomValues: Record<string, any> = {};
    customFields.forEach(field => {
      defaultCustomValues[field.id] = field.type === 'Number' ? undefined : '';
    });

    form.reset({
      name: "",
      email: "",
      phone: "",
      source: "Website Form",
      status: defaultStatus || pipelineStages[0]?.name,
      inquiryType: "General OPD",
      assignedToId: undefined,
      customFields: defaultCustomValues,
    });
  }, [open, defaultStatus, form, customFields, pipelineStages])

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

        // Trigger AI analysis in background for specific sources
        if (newLead.source === 'Website Form') {
            (async () => {
                try {
                    const insights = await summarizeLead({
                        name: newLead.name,
                        inquiryType: newLead.inquiryType,
                        history: newLead.history,
                        notes: newLead.notes,
                        customFields: newLead.customFields
                    });
                    const aiNoteContent = `**AI Summary:** ${insights.summary}\n**Temperature:** ${insights.temperature}`;
                    await addNote(newLead.id, aiNoteContent, 'user-ai');
                    await addHistoryItem(newLead.id, 'AI analysis completed.', 'user-ai');
                } catch (e) {
                    console.error("Background AI workflow failed for new lead:", e);
                }
            })();
        }

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

  const renderFieldTree = (fields: FieldWithChildren[]) => {
    return fields.map(fieldWithChildren => {
        const { children, ...field } = fieldWithChildren;
        return (
            <div key={field.id} className="w-full space-y-4">
                {renderCustomField(field as CustomFieldDefinition)}
                {children?.length > 0 && <div className="mt-4 border-l-2 pl-4 border-dashed ml-2 space-y-4">{renderFieldTree(children)}</div>}
            </div>
        )
    })
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
                            <FormItem><FormLabel>Assign To</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select a team member" /></SelectTrigger></FormControl><SelectContent>{assignableUsers.map(user => <SelectItem key={user.id} value={user.id}>{user.name}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>
                        )}
                    />

                    {customFieldTree.length > 0 && (
                        <>
                            <Separator />
                            <div className="space-y-2">
                                <h4 className="text-sm font-medium">Additional Details</h4>
                            </div>
                            <div className="space-y-4">
                                {renderFieldTree(customFieldTree)}
                            </div>
                        </>
                    )}
                </>
            
            <DialogFooter className="pr-1 sticky bottom-0 bg-background py-4">
                <DialogClose asChild>
                    <Button type="button" variant="secondary">Cancel</Button>
                </DialogClose>
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Creating...' : 'Create Lead'}
                </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
