import { getLeadById } from "@/lib/data"
import { notFound } from "next/navigation"
import { PatientInfoCard } from "@/components/lead-profile/patient-info-card"
import { PatientJourney } from "@/components/lead-profile/patient-journey"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export default async function LeadProfilePage({ params }: { params: { id: string } }) {
  const lead = await getLeadById(params.id)

  if (!lead || lead.deletedAt) {
    notFound()
  }

  return (
    <div className="space-y-6">
        <div>
            <Button asChild variant="outline" size="sm">
                <Link href="/dashboard">
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Back to Dashboard
                </Link>
            </Button>
        </div>
        <div className="grid lg:grid-cols-3 xl:grid-cols-4 gap-8">
            <div className="lg:col-span-1 xl:col-span-1 space-y-6">
                <PatientInfoCard lead={lead} />
            </div>
            <div className="lg:col-span-2 xl:col-span-3">
                <PatientJourney lead={lead} />
            </div>
        </div>
    </div>
  )
}
