'use client'

import type { Lead } from '@/lib/types'
import { useDraggable } from '@dnd-kit/core'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { Badge } from '../ui/badge'

export function LeadCard({ lead, isOverlay }: { lead: Lead, isOverlay?: boolean }) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: lead.id,
        data: {
            lead
        }
    });

    const style: React.CSSProperties = {
        transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
        opacity: isDragging && !isOverlay ? 0.5 : 1,
        cursor: isDragging ? 'grabbing' : 'grab',
    };

    return (
        <Card 
            ref={setNodeRef} 
            style={style} 
            {...attributes} 
            {...listeners}
            className={`mb-4 touch-none ${isOverlay ? 'shadow-2xl' : ''}`}
        >
            <CardHeader className="p-4 pb-2">
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
