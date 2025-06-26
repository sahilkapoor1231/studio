import { HistoryItem } from '@/lib/types'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { format, parseISO } from 'date-fns'

export function JourneyTimeline({ history }: { history: HistoryItem[] }) {
    if (history.length === 0) {
        return <div className="text-center text-muted-foreground py-8">No history recorded yet.</div>
    }

  return (
    <div className="space-y-8">
      {history.map((item, index) => (
        <div key={item.id} className="flex gap-4">
          <div className="flex flex-col items-center">
            <Avatar className="h-10 w-10">
              <AvatarImage src={item.user.avatarUrl} alt={item.user.name} data-ai-hint="person face"/>
              <AvatarFallback>{item.user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            {index < history.length - 1 && (
              <div className="mt-2 w-px flex-1 bg-border" />
            )}
          </div>
          <div className="flex-1">
            <p className="font-medium">{item.action}</p>
            <p className="text-sm text-muted-foreground">
              by {item.user.name}
            </p>
            <time className="text-xs text-muted-foreground">
              {format(parseISO(item.timestamp), 'PPpp')}
            </time>
          </div>
        </div>
      ))}
    </div>
  )
}
