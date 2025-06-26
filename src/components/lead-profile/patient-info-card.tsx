import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Lead } from '@/lib/types'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import {
  CheckCircle,
  Mail,
  MessageSquare,
  Phone,
  SlashCircle,
  XCircle,
  CalendarPlus
} from 'lucide-react'

export function PatientInfoCard({ lead }: { lead: Lead }) {
  return (
    <Card>
      <CardHeader className="items-center text-center">
        <Avatar className="h-24 w-24 border-2 border-primary">
          <AvatarImage src={lead.photoUrl} alt={lead.name} data-ai-hint="person face" />
          <AvatarFallback>{lead.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <CardTitle className="mt-4">{lead.name}</CardTitle>
        <CardDescription>{lead.inquiryType}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 text-sm">
          <div className="flex items-center gap-3">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <a href={`mailto:${lead.email}`} className="text-primary hover:underline">
              {lead.email}
            </a>
          </div>
          <div className="flex items-center gap-3">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <span>{lead.phone}</span>
          </div>
          <div className="flex items-start gap-3">
            <span className="font-medium text-muted-foreground">Source:</span>
            <Badge variant="secondary">{lead.source}</Badge>
          </div>
          <div className="flex items-start gap-3">
            <span className="font-medium text-muted-foreground">Assigned:</span>
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={lead.assignedTo.avatarUrl} alt={lead.assignedTo.name} data-ai-hint="person face" />
                <AvatarFallback>{lead.assignedTo.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <span>{lead.assignedTo.name}</span>
            </div>
          </div>
          {lead.tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 pt-2">
              {lead.tags.map((tag) => (
                <Badge key={tag} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="grid grid-cols-2 gap-2">
        <Button variant="outline">
          <MessageSquare className="mr-2 h-4 w-4" /> Message
        </Button>
        <Button variant="outline">
          <Phone className="mr-2 h-4 w-4" /> Call
        </Button>
        <Button>
            <CalendarPlus className="mr-2 h-4 w-4" /> Book Appt.
        </Button>
        <Button variant="destructive">
          <XCircle className="mr-2 h-4 w-4" /> No Go
        </Button>
      </CardFooter>
    </Card>
  )
}
