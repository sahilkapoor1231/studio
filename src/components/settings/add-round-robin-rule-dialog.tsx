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
import type { User, RoundRobinRule, LeadSource, RoundRobinAssignment } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import { addRoundRobinRule as addRoundRobinRuleToDb } from "@/lib/data"
import { useAppContext } from "@/lib/app-context"

const leadSources = ['Website Form', 'Facebook Ad', 'Walk-in', 'IVR', 'WhatsApp'] as const;

const formSchema = z.object({
  name: z.string().min(3, "Rule name must be at least 3 characters."),
  source: z.enum(leadSources, { required_error: "Please select a source." }),
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
  const { assignableUsers, addRoundRobinRule } = useAppContext();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      source: undefined,
      assignments: assignableUsers.map(u => ({ userId: u.id, enabled: false, weight: 1 })),
    },
  });

  const { fields } = useFieldArray({
      control: form.control,
      name: "assignments"
  });

  useEffect(() => {
    if (open) {
      form.reset({
        name: "",
        source: undefined,
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Round Robin Rule</DialogTitle>
          <DialogDescription>
            Create a rule to automatically distribute new leads based on weights.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rule Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Facebook Ad Leads" {...field} />
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
                  <FormLabel>When lead source is...</FormLabel>
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
              name="assignments"
              render={() => (
                <FormItem>
                  <div className="mb-4">
                    <FormLabel>Distribute leads among these users</FormLabel>
                    <FormDescription>
                      Select users and assign a weight. For example, a weight of 2 and 5 means for every 7 leads, one user gets 2 and the other gets 5.
                    </FormDescription>
                  </div>
                  <div className="space-y-3 max-h-[25vh] overflow-y-auto pr-2">
                    {fields.map((item, index) => {
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
                                            // Reset weight to 1 if user is re-enabled
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
