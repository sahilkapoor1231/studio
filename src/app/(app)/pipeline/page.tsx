import { getLeads } from "@/lib/data"
import { Lead, LeadStatus } from "@/lib/types"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"

const pipelineStages: LeadStatus[] = [
  'New',
  'Contacted',
  'Qualified',
  'Appointment Scheduled',
  'Converted',
];

function LeadCard({ lead }: { lead: Lead }) {
    return (
        <Card className="mb-4">
            <CardHeader className="p-4">
                <Link href={`/leads/${lead.id}`}>
                    <CardTitle className="text-base hover:underline">{lead.name}</CardTitle>
                </Link>
            </CardHeader>
            <CardContent className="p-4 pt-0">
                <p className="text-sm text-muted-foreground mb-2">{lead.inquiryType}</p>
                <div className="flex flex-wrap gap-1">
                    {lead.tags.map(tag => (
                        <Badge key={tag} variant="secondary">{tag}</Badge>
                    ))}
                </div>
            </CardContent>
            <CardFooter className="flex justify-between items-center p-4 pt-0">
                <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                        <AvatarImage src={lead.assignedTo.avatarUrl} alt={lead.assignedTo.name} data-ai-hint="person face" />
                        <AvatarFallback>{lead.assignedTo.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span className="text-xs text-muted-foreground">{lead.assignedTo.name}</span>
                </div>
                 <Badge variant="outline">{lead.source}</Badge>
            </CardFooter>
        </Card>
    )
}

function PipelineColumn({ title, leads }: { title: LeadStatus, leads: Lead[] }) {
    return (
        <div className="flex-1 min-w-[300px] bg-muted/50 rounded-lg p-4">
            <div className="flex justify-between items-center mb-4">
                <h2 className="font-semibold">{title}</h2>
                <span className="text-sm font-medium text-muted-foreground bg-background px-2 py-0.5 rounded-full">{leads.length}</span>
            </div>
            <div className="space-y-4">
                {leads.map(lead => <LeadCard key={lead.id} lead={lead} />)}
            </div>
             <Button variant="ghost" className="w-full mt-4">
                <Plus className="mr-2 h-4 w-4" />
                Add Lead
            </Button>
        </div>
    )
}


export default async function PipelinePage() {
    const leads = await getLeads();

    return (
        <div className="space-y-6 h-full flex flex-col">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Sales Pipeline</h1>
                <p className="text-muted-foreground">Visualize and manage your lead flow.</p>
            </div>
            <div className="flex-1 overflow-x-auto pb-4">
                <div className="flex gap-6 h-full">
                    {pipelineStages.map(stage => (
                        <PipelineColumn 
                            key={stage}
                            title={stage}
                            leads={leads.filter(l => l.status === stage)}
                        />
                    ))}
                </div>
            </div>
        </div>
    )
}