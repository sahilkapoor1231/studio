'use client'

import { useState, useEffect } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import type { Lead, CustomFieldDefinition } from '@/lib/types'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import {
  Mail,
  Phone,
  CalendarPlus,
  XCircle,
  Info,
  MessageSquare,
  Loader2,
} from 'lucide-react'
import { Separator } from '../ui/separator'
import { getCustomFields, updateLeadStatus } from '@/lib/data'
import { Skeleton } from '../ui/skeleton'
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'
import { BookAppointmentDialog } from './book-appointment-dialog'

export function PatientInfoCard({ lead }: { lead: Lead }) {
  const [customFieldDefs, setCustomFieldDefs] = useState<CustomFieldDefinition[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    async function loadDefs() {
        setIsLoading(true);
        const defs = await getCustomFields();
        setCustomFieldDefs(defs);
        setIsLoading(false);
    }
    loadDefs();
  }, [])
  
  const populatedCustomFields = customFieldDefs
    .map(def => ({
        label: def.label,
        value: lead.customFields?.[def.id]
    }))
    .filter(field => field.value !== undefined && field.value !== null && field.value !== '');

  const handleNoGo = async () => {
    setIsUpdating(true);
    try {
      await updateLeadStatus(lead.id, 'No Go');
      toast({
        title: "Lead Status Updated",
        description: `${lead.name} has been marked as "No Go".`
      });
      router.refresh();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update lead status.",
        variant: "destructive"
      });
    } finally {
        setIsUpdating(false);
    }
  }

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
            <a href={`mailto:${lead.email}`} className="text-primary hover:underline truncate">
              {lead.email}
            </a>
          </div>
          <div className="flex items-center gap-3">
            <Phone className="h-4 w-4 text-muted-foreground" />
             <a href={`tel:${lead.phone}`} className="text-primary hover:underline truncate">
              {lead.phone}
            </a>
          </div>
          <div className="flex items-start gap-3">
            <span className="font-medium text-muted-foreground shrink-0">Source:</span>
            <Badge variant="secondary">{lead.source}</Badge>
          </div>
          <div className="flex items-start gap-3">
            <span className="font-medium text-muted-foreground shrink-0">Assigned:</span>
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={lead.assignedTo.avatarUrl} alt={lead.assignedTo.name} data-ai-hint="person face" />
                <AvatarFallback>{lead.assignedTo.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <span className="truncate">{lead.assignedTo.name}</span>
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

        {(isLoading || populatedCustomFields.length > 0) && (
          <>
            <Separator className="my-4" />
            <div className="space-y-3 text-sm">
                <h4 className="font-medium flex items-center gap-2 text-muted-foreground"><Info className="h-4 w-4" /> Additional Details</h4>
                {isLoading ? (
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-2/3" />
                    </div>
                ) : (
                    populatedCustomFields.map(({label, value}) => (
                        <div key={label} className="flex justify-between items-center">
                            <span className="font-medium text-muted-foreground">{label}:</span>
                            <span className="text-right">{String(value)}</span>
                        </div>
                    ))
                )}
            </div>
          </>
        )}
      </CardContent>
      <CardFooter className="grid grid-cols-2 gap-2">
        <Button variant="outline" asChild>
          <a href={`mailto:${lead.email}`}>
            <MessageSquare className="mr-2 h-4 w-4" /> Message
          </a>
        </Button>
        <Button variant="outline" asChild>
          <a href={`tel:${lead.phone}`}>
            <Phone className="mr-2 h-4 w-4" /> Call
          </a>
        </Button>
        <BookAppointmentDialog lead={lead}>
            <Button disabled={isUpdating}>
                <CalendarPlus className="mr-2 h-4 w-4" /> Book Appt.
            </Button>
        </BookAppointmentDialog>
        <Button variant="destructive" onClick={handleNoGo} disabled={isUpdating}>
          {isUpdating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <XCircle className="mr-2 h-4 w-4" />}
          No Go
        </Button>
      </CardFooter>
    </Card>
  )
}
