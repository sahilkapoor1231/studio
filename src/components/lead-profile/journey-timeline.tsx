'use client'

import { useEffect, useState } from 'react'
import { HistoryItem } from '@/lib/types'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { format, parseISO } from 'date-fns'
import { Skeleton } from '../ui/skeleton'
import { User } from 'lucide-react'

export function JourneyTimeline({ history }: { history: HistoryItem[] }) {
    const [isMounted, setIsMounted] = useState(false)

    useEffect(() => {
        setIsMounted(true)
    }, [])

    if (history.length === 0) {
        return <div className="text-center text-muted-foreground py-8">No history recorded yet.</div>
    }

  return (
    <div className="space-y-8">
      {history.map((item, index) => (
        <div key={item.id} className="flex gap-4">
          <div className="flex flex-col items-center">
            <Avatar className="h-10 w-10">
              {item.user ? (
                <>
                    <AvatarImage src={item.user.avatarUrl} alt={item.user.name} data-ai-hint="person face"/>
                    <AvatarFallback>{item.user.name.charAt(0)}</AvatarFallback>
                </>
              ) : (
                <AvatarFallback><User className="h-5 w-5" /></AvatarFallback>
              )}
            </Avatar>
            {index < history.length - 1 && (
              <div className="mt-2 w-px flex-1 bg-border" />
            )}
          </div>
          <div className="flex-1">
            <p className="font-medium">{item.action}</p>
            <p className="text-sm text-muted-foreground">
              by {item.user ? item.user.name : 'System'}
            </p>
            <time className="text-xs text-muted-foreground">
              {isMounted ? (
                format(parseISO(item.timestamp), 'PPpp')
              ) : (
                <Skeleton className="h-4 w-[200px]" />
              )}
            </time>
          </div>
        </div>
      ))}
    </div>
  )
}
