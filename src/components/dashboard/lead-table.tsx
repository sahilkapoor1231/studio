'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Lead } from '@/lib/types'
import Link from 'next/link'
import { MoreHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { format, parseISO } from 'date-fns'
import { ReassignLeadDialog } from './reassign-lead-dialog'
import { ScheduleFollowUpDialog } from './schedule-follow-up-dialog'

const statusColors: { [key: string]: 'default' | 'secondary' | 'destructive' | 'outline' } = {
    'New': 'default',
    'Contacted': 'secondary',
    'Qualified': 'outline',
    'Appointment Scheduled': 'default',
    'No Go': 'destructive',
    'Converted': 'default',
};

export function LeadTable({ leads, onLeadUpdated }: { leads: Lead[], onLeadUpdated: (lead: Lead) => void }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Leads</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead className="hidden md:table-cell">Source</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden lg:table-cell">Assigned To</TableHead>
              <TableHead className="hidden lg:table-cell">Last Contacted</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leads.map((lead) => (
              <TableRow key={lead.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="hidden h-9 w-9 sm:flex">
                      <AvatarImage src={lead.photoUrl} alt={lead.name} data-ai-hint="person face" />
                      <AvatarFallback>{lead.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="grid gap-1">
                      <Link href={`/leads/${lead.id}`} className="font-medium hover:underline">
                        {lead.name}
                      </Link>
                      <p className="text-sm text-muted-foreground md:hidden">
                        {lead.source}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <Badge variant="outline">{lead.source}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={statusColors[lead.status] || 'secondary'}>{lead.status}</Badge>
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                        <AvatarImage src={lead.assignedTo.avatarUrl} alt={lead.assignedTo.name} data-ai-hint="person face"/>
                        <AvatarFallback>{lead.assignedTo.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span>{lead.assignedTo.name}</span>
                  </div>
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  {format(parseISO(lead.lastContacted), 'PPP')}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button aria-haspopup="true" size="icon" variant="ghost">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Toggle menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem asChild>
                        <Link href={`/leads/${lead.id}`}>View Profile</Link>
                      </DropdownMenuItem>
                      <ScheduleFollowUpDialog lead={lead}>
                        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                            Schedule Follow-up
                        </DropdownMenuItem>
                      </ScheduleFollowUpDialog>
                      <ReassignLeadDialog lead={lead} onLeadUpdated={onLeadUpdated}>
                        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                          Reassign
                        </DropdownMenuItem>
                      </ReassignLeadDialog>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive">
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
