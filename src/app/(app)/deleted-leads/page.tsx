import { getDeletedLeads } from "@/lib/data"
import { DeletedLeadsView } from "@/components/deleted-leads/deleted-leads-view"

export default async function DeletedLeadsPage() {
  const deletedLeads = await getDeletedLeads()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Recycle Bin</h1>
        <p className="text-muted-foreground">
          This is a log of all deleted leads. You can restore a lead from here.
        </p>
      </div>
      <DeletedLeadsView initialLeads={deletedLeads} />
    </div>
  )
}
