'use client'

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import type { User, RoundRobinRule, LeadSource } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import { addRoundRobinRule } from "@/lib/data"

const leadSources = ['Website Form', 'Facebook Ad', 'Walk-in', 'IVR', 'WhatsApp'] as const;

const formSchema = z.object({
  name: z.string().min(3, "Rule name must be at least 3 characters."),
  source: z.custom<LeadSource>({required_error: "Please select a source."}),
  userIds: z.array(z.string()).refine(value => value.length >= 1, {
    message: "You must select at least one user.",
  }),
});

type FormValues = z.infer<typeof formSchema>;

export function AddRoundRobinRuleDialog({ children, onRuleAdded, users }: { children: React.ReactNode, onRuleAdded: (rule: RoundRobinRule) => void, users: User[] }) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      userIds: [],
    },
  });

  async function onSubmit(values: FormValues) {
    try {
        const newRule = await addRoundRobinRule({
            name: values.name,
            source: values.source,
            userIds: values.userIds,
        });
        onRuleAdded(newRule);
        toast({
            title: "Rule Added",
            description: `The rule "${newRule.name}" has been created.`,
        });
        setOpen(false);
        form.reset();
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Round Robin Rule</DialogTitle>
          <DialogDescription>
            Create a rule to automatically distribute new leads.
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
              name="userIds"
              render={() => (
                <FormItem>
                  <div className="mb-4">
                    <FormLabel>Distribute leads among these users</FormLabel>
                    <FormDescription>
                      Select the users who will receive leads from this source.
                    </FormDescription>
                  </div>
                  <div className="space-y-2">
                    {users.map((user) => (
                      <FormField
                        key={user.id}
                        control={form.control}
                        name="userIds"
                        render={({ field }) => {
                          return (
                            <FormItem key={user.id} className="flex flex-row items-start space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(user.id)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...(field.value || []), user.id])
                                      : field.onChange(
                                          field.value?.filter(
                                            (value) => value !== user.id
                                          )
                                        );
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal">
                                {user.name} ({user.role})
                              </FormLabel>
                            </FormItem>
                          );
                        }}
                      />
                    ))}
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
