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
import { Input } from "@/components/ui/input"
import type { PipelineStage } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import { addPipelineStage } from "@/lib/data"

const formSchema = z.object({
  name: z.string().min(2, { message: "Stage name must be at least 2 characters." }),
})

type AddStageFormValues = z.infer<typeof formSchema>

export function AddStageDialog({ children, onStageAdded }: { children: React.ReactNode, onStageAdded: (newStage: PipelineStage) => void }) {
  const [open, setOpen] = useState(false)
  const { toast } = useToast()

  const form = useForm<AddStageFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
    },
  })

  async function onSubmit(values: AddStageFormValues) {
    try {
        const newStage = await addPipelineStage({ name: values.name });
        onStageAdded(newStage);
        toast({
            title: "Stage Added",
            description: `The pipeline stage "${newStage.name}" has been created.`,
        })
        setOpen(false)
        form.reset()
    } catch (error) {
        toast({
            title: "Error",
            description: "Could not create the pipeline stage.",
            variant: "destructive"
        })
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Pipeline Stage</DialogTitle>
          <DialogDescription>
            Define a new column for your kanban board.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Stage Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Follow-up" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
                <DialogClose asChild>
                    <Button type="button" variant="secondary">Cancel</Button>
                </DialogClose>
                <Button type="submit">Create Stage</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
