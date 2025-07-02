'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { CalendarPlus, Loader2, XCircle, X } from "lucide-react"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "../ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"
import { bulkUpdateLeadStatus } from "@/lib/data"
import { BulkScheduleAppointmentDialog } from "./bulk-schedule-appointment-dialog"

export function BulkActionsToolbar({
  selectedCount,
  selectedLeadIds,
  onClearSelection,
}: {
  selectedCount: number
  selectedLeadIds: string[]
  onClearSelection: () => void
}) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleMarkAsNoGo = async () => {
    setIsLoading(true);
    try {
        await bulkUpdateLeadStatus(selectedLeadIds, 'No Go', 'user-2'); // Assume current user is user-2
        toast({
            title: "Leads Updated",
            description: `${selectedLeadIds.length} leads have been marked as "No Go".`
        });
        onClearSelection();
        router.refresh(); // Reload data from server
    } catch (error) {
        toast({
            title: "Error",
            description: "Could not update leads. Please try again.",
            variant: "destructive"
        });
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-x-4 bottom-4 z-50 rounded-lg border bg-background/95 p-3 shadow-lg backdrop-blur-sm animate-in slide-in-from-bottom-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
            <p className="text-sm font-medium">
                {selectedCount} lead{selectedCount > 1 ? 's' : ''} selected
            </p>
            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm" disabled={isLoading}>
                        {isLoading ? <Loader2 className="mr-2 animate-spin"/> : <XCircle className="mr-2"/>}
                        Mark as No Go
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will mark {selectedCount} selected leads as "No Go". This action can be reversed from the lead profile.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleMarkAsNoGo} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">Confirm</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            <BulkScheduleAppointmentDialog leadIds={selectedLeadIds} onComplete={onClearSelection}>
                <Button variant="outline" size="sm" disabled={isLoading}>
                    <CalendarPlus className="mr-2" />
                    Schedule Appointment
                </Button>
            </BulkScheduleAppointmentDialog>
        </div>
        <Button variant="ghost" size="icon" onClick={onClearSelection}>
            <X />
            <span className="sr-only">Clear selection</span>
        </Button>
      </div>
    </div>
  )
}
