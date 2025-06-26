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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import type { CustomFieldDefinition } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import { addCustomField } from "@/lib/data"

const fieldTypes = ['Text', 'Number', 'Date', 'Select'] as const;

const formSchema = z.object({
  label: z.string().min(2, { message: "Label must be at least 2 characters." }),
  type: z.enum(fieldTypes),
  required: z.boolean(),
  options: z.string().optional(),
}).refine(data => {
    if (data.type === 'Select') {
        return data.options && data.options.length > 0;
    }
    return true;
}, {
    message: "Options are required for Select type.",
    path: ["options"],
});


type AddFieldFormValues = z.infer<typeof formSchema>

export function AddCustomFieldDialog({ children, onFieldAdded }: { children: React.ReactNode, onFieldAdded: (newField: CustomFieldDefinition) => void }) {
  const [open, setOpen] = useState(false)
  const { toast } = useToast()

  const form = useForm<AddFieldFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      label: "",
      type: "Text",
      required: false,
      options: "",
    },
  })

  const selectedType = form.watch("type");

  async function onSubmit(values: AddFieldFormValues) {
    try {
        const fieldData: Omit<CustomFieldDefinition, 'id'> = {
            label: values.label,
            type: values.type,
            required: values.required,
        };

        if (values.type === 'Select' && values.options) {
            fieldData.options = values.options.split(',').map(opt => opt.trim());
        }

        const newField = await addCustomField(fieldData);
        onFieldAdded(newField);
        toast({
            title: "Field Added",
            description: `The custom field "${newField.label}" has been created.`,
        })
        setOpen(false)
        form.reset()
    } catch (error) {
        toast({
            title: "Error",
            description: "Could not create the custom field.",
            variant: "destructive"
        })
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Custom Field</DialogTitle>
          <DialogDescription>
            Define a new custom field for your lead forms.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="label"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Field Label</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Company Name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Field Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a type" />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                        {fieldTypes.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <FormMessage />
                    </FormItem>
                )}
            />
            {selectedType === 'Select' && (
                 <FormField
                    control={form.control}
                    name="options"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Options</FormLabel>
                        <FormControl>
                            <Input placeholder="e.g., High, Medium, Low" {...field} />
                        </FormControl>
                        <FormDescription>
                            Enter comma-separated values for the dropdown.
                        </FormDescription>
                        <FormMessage />
                        </FormItem>
                    )}
                />
            )}
            <FormField
              control={form.control}
              name="required"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Required</FormLabel>
                    <p className="text-[0.8rem] text-muted-foreground">
                        Make this field mandatory for all new leads.
                    </p>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <DialogFooter>
                <DialogClose asChild>
                    <Button type="button" variant="secondary">Cancel</Button>
                </DialogClose>
                <Button type="submit">Create Field</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
