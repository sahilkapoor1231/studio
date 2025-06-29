import { getLeadById } from "@/lib/data"
import { notFound } from "next/navigation"
import { PatientInfoCard } from "@/components/lead-profile/patient-info-card"
import { PatientJourney } from "@/components/lead-profile/patient-journey"
import Link from "next/link"
import { ChevronLeft, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default async function LeadProfilePage({ params }: { params: { id: string } }) {
  const lead = await getLeadById(params.id)

  if (!lead) {
    notFound()
  }
  
  const isReadOnly = !!lead.deletedAt;

  return (
    <div className="space-y-6">
        <div>
            <Button asChild variant="outline" size="sm">
                <Link href={isReadOnly ? "/deleted-leads" : "/dashboard"}>
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Back to {isReadOnly ? 'Recycle Bin' : 'Dashboard'}
                </Link>
            </Button>
        </div>

        {isReadOnly && (
            <Alert variant="destructive">
                <Trash2 className="h-4 w-4" />
                <AlertTitle>This Lead is in the Recycle Bin</AlertTitle>
                <AlertDescription>
                    This lead was deleted and is now in a read-only state. You can view its history, but you cannot perform any actions.
                </AlertDescription>
            </Alert>
        )}

        <div className="grid lg:grid-cols-3 xl:grid-cols-4 gap-8">
            <div className="lg:col-span-1 xl:col-span-1 space-y-6">
                <PatientInfoCard lead={lead} isReadOnly={isReadOnly} />
            </div>
            <div className="lg:col-span-2 xl:col-span-3">
                <PatientJourney lead={lead} isReadOnly={isReadOnly} />
            </div>
        </div>
    </div>
  )
}
