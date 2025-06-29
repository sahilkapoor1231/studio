'use client'

import { useState } from "react"
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
import Link from "next/link"
import { MoreHorizontal, RotateCcw } from "lucide-react"
import type { Lead } from "@/lib/types"
import { Button } from "../ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu"
import { RestoreReassignDialog } from "./restore-reassign-dialog"
import { useRouter } from "next/navigation"

export function DeletedLeadsView({ initialLeads }: { initialLeads: Lead[] }) {
    const [leads, setLeads] = useState<Lead[]>(initialLeads);
    const router = useRouter();
    
    const handleLeadRestored = (restoredLeadId: string) => {
        setLeads(prev => prev.filter(l => l.id !== restoredLeadId));
        router.refresh(); // Refresh other parts of the app like dashboard counts
    }

    return (
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
                    <TableHead><span className="sr-only">Actions</span></TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {leads.length === 0 && (
                    <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                        No leads have been deleted.
                    </TableCell>
                    </TableRow>
                )}
                {leads.map((lead) => (
                    <TableRow key={lead.id}>
                    <TableCell>
                        <Link href={`/leads/${lead.id}`} className="font-medium hover:underline">
                        {lead.name}
                        </Link>
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
                    <TableCell>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="h-4 w-4" />
                                    <span className="sr-only">Actions</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <RestoreReassignDialog lead={lead} onLeadRestored={handleLeadRestored}>
                                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                        <RotateCcw className="mr-2 h-4 w-4" />
                                        Restore & Reassign
                                    </DropdownMenuItem>
                                </RestoreReassignDialog>
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
