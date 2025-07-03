'use client'

import { useState, useEffect } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import type { User, RoundRobinRule, LeadSource, RoundRobinAssignment, WorkflowConditionField, WorkflowConditionOperator, LeadStage } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import { addRoundRobinRule as addRoundRobinRuleToDb } from "@/lib/data"
import { useAppContext } from "@/lib/app-context"
import { PlusCircle, Trash2 } from "lucide-react"

const leadSources = ['Website Form', 'Facebook Ad', 'Walk-in', 'IVR', 'WhatsApp', 'Zapier', 'LinkedIn', 'Calendly'] as const;
const inquiryTypes = ['General OPD', 'IVF Journey', 'Surgery Consultation'] as const;
const leadStages: LeadStage[] = ['Initial Inquiry', 'Consultation Done', 'Procedure Booked', 'Follow-up Required'];


const conditionSchema = z.object({
  id: z.string().optional(),
  field: z.custom<WorkflowConditionField>(),
  operator: z.custom<WorkflowConditionOperator>(),
  value: z.string().min(1, "Value is required"),
});

const formSchema = z.object({
  name: z.string().min(3, "Rule name must be at least 3 characters."),
  source: z.enum(leadSources, { required_error: "Please select a source." }),
  conditions: z.array(conditionSchema),
  assignments: z.array(z.object({
    userId: z.string(),
    enabled: z.boolean(),
    weight: z.coerce.number().min(1, "Weight must be at least 1."),
  })).refine((assignments) => assignments.some(a => a.enabled), {
    message: "You must enable at least one user for assignment.",
  }),
});

type FormValues = z.infer<typeof formSchema>;

export function AddRoundRobinRuleDialog({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const { assignableUsers, addRoundRobinRule, pipelineStages } = useAppContext();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      source: undefined,
      conditions: [],
      assignments: assignableUsers.map(u => ({ userId: u.id, enabled: false, weight: 1 })),
    },
  });

  const { fields: assignmentFields } = useFieldArray({
      control: form.control,
      name: "assignments"
  });

  const { fields: conditionFields, append, remove } = useFieldArray({
    control: form.control,
    name: "conditions",
  });

  useEffect(() => {
    if (open) {
      form.reset({
        name: "",
        source: undefined,
        conditions: [],
        assignments: assignableUsers.map(u => ({ userId: u.id, enabled: false, weight: 1 })),
      });
    }
  }, [open, assignableUsers, form]);


  async function onSubmit(values: FormValues) {
    try {
        const finalAssignments: RoundRobinAssignment[] = values.assignments
            .filter(a => a.enabled)
            .map(({ userId, weight }) => ({ userId, weight }));

        if (finalAssignments.length === 0) {
             toast({
                title: "Validation Error",
                description: "You must select and enable at least one user.",
                variant: "destructive",
            });
            return;
        }

        const newRule = await addRoundRobinRuleToDb({
            name: values.name,
            source: values.source,
            conditions: values.conditions,
            assignments: finalAssignments,
        });
        addRoundRobinRule(newRule);
        toast({
            title: "Rule Added",
            description: `The rule "${newRule.name}" has been created.`,
        });
        setOpen(false);
    } catch (error) {
        toast({
            title: "Error",
            description: (error as Error).message || "Could not create the rule.",
            variant: "destructive"
        });
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
          <DialogTitle>Add Round Robin Rule</DialogTitle>
          <DialogDescription>
            Create a rule to automatically distribute new leads based on source, conditions, and weights.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-h-[70vh] overflow-y-auto pr-6 pl-1">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rule Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Spanish IVF Leads" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="rounded-md border p-4 space-y-4">
                <h4 className="font-semibold text-sm">Conditions (IF)</h4>
                <FormField
                    control={form.control}
                    name="source"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Lead source is...</FormLabel>
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
                 {conditionFields.map((item, index) => (
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
                                                {getConditionValueOptions(form.watch(`conditions.${index}.field`)).map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
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
            <FormField
              control={form.control}
              name="assignments"
              render={() => (
                <FormItem>
                  <div className="mb-4">
                    <FormLabel>Distribute leads among these users (THEN)</FormLabel>
                    <FormDescription>
                      Select users and assign a weight. A weight of 2 and 5 means for every 7 matching leads, one user gets 2 and the other gets 5.
                    </FormDescription>
                  </div>
                  <div className="space-y-3 max-h-[25vh] overflow-y-auto pr-2">
                    {assignmentFields.map((item, index) => {
                      const user = assignableUsers.find(u => u.id === item.userId);
                      if (!user) return null;
                      return (
                        <div key={item.id} className="flex items-center gap-4 p-2 border rounded-md bg-background">
                            <FormField
                                control={form.control}
                                name={`assignments.${index}.enabled`}
                                render={({ field }) => (
                                <FormItem className="flex-none">
                                    <FormControl>
                                    <Checkbox
                                        checked={field.value}
                                        onCheckedChange={(checked) => {
                                            field.onChange(checked);
                                            if (checked) {
                                                form.setValue(`assignments.${index}.weight`, 1, { shouldValidate: true });
                                            }
                                        }}
                                    />
                                    </FormControl>
                                </FormItem>
                                )}
                            />
                          <FormLabel className="font-normal flex-1 text-sm">{user.name} <span className="text-muted-foreground">({user.role})</span></FormLabel>
                          <div className="flex items-center gap-2">
                             <FormLabel htmlFor={`assignments.${index}.weight`} className="text-xs text-muted-foreground">Weight</FormLabel>
                              <FormField
                                control={form.control}
                                name={`assignments.${index}.weight`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormControl>
                                      <Input
                                        type="number"
                                        min="1"
                                        className="w-16 h-8"
                                        disabled={!form.watch(`assignments.${index}.enabled`)}
                                        {...field}
                                      />
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="secondary">Cancel</Button>
              </DialogClose>
              <Button type="submit">Create Rule</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
