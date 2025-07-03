'use client'

import { Button } from "@/components/ui/button"
import { RotateCcw, X } from "lucide-react"
import { BulkRestoreDialog } from "./bulk-restore-dialog"

export function BulkActionsToolbar({
  selectedCount,
  selectedLeadIds,
  onClearSelection,
  onRestoreComplete,
}: {
  selectedCount: number
  selectedLeadIds: string[]
  onClearSelection: () => void
  onRestoreComplete: () => void
}) {

  return (
    <div className="fixed inset-x-4 bottom-4 z-50 rounded-lg border bg-background/95 p-3 shadow-lg backdrop-blur-sm animate-in slide-in-from-bottom-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
            <p className="text-sm font-medium">
                {selectedCount} lead{selectedCount > 1 ? 's' : ''} selected
            </p>
            <BulkRestoreDialog leadIds={selectedLeadIds} onComplete={onRestoreComplete}>
                <Button variant="outline" size="sm">
                    <RotateCcw className="mr-2" />
                    Restore & Reassign
                </Button>
            </BulkRestoreDialog>
        </div>
        <Button variant="ghost" size="icon" onClick={onClearSelection}>
            <X />
            <span className="sr-only">Clear selection</span>
        </Button>
      </div>
    </div>
  )
}
