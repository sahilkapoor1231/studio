import { getDeletedLeads } from "@/lib/data"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { format, parseISO } from 'date-fns'
import { Badge } from "@/components/ui/badge"

export default async function DeletedLeadsPage() {
  const deletedLeads = await getDeletedLeads()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Recycle Bin</h1>
        <p className="text-muted-foreground">
          This is a permanent, read-only log of all deleted leads. Records here are for auditing purposes and cannot be restored or modified.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Deleted Leads Log</CardTitle>
          <CardDescription>A list of all deleted lead records from the system.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Lead Name</TableHead>
                <TableHead>Status at Deletion</TableHead>
                <TableHead>Deleted By</TableHead>
                <TableHead>Date Deleted</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {deletedLeads.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    No leads have been deleted.
                  </TableCell>
                </TableRow>
              )}
              {deletedLeads.map((lead) => (
                <TableRow key={lead.id}>
                  <TableCell>
                    {lead.name}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{lead.status}</Badge>
                  </TableCell>
                  <TableCell>
                    {lead.deletedBy && (
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={lead.deletedBy.avatarUrl} alt={lead.deletedBy.name} data-ai-hint="person face" />
                          <AvatarFallback>{lead.deletedBy.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span>{lead.deletedBy.name}</span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    {lead.deletedAt && format(parseISO(lead.deletedAt), 'PPpp')}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
