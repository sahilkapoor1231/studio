import { Note } from '@/lib/types'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { formatDistanceToNow, parseISO } from 'date-fns'
import { Textarea } from '../ui/textarea'
import { Button } from '../ui/button'

export function NotesFeed({ notes }: { notes: Note[] }) {
  return (
    <div className="space-y-6">
      <div>
        <Textarea placeholder="Add an internal note... Use @ to mention a team member." />
        <Button className="mt-2">Add Note</Button>
      </div>
      <div className="space-y-4">
        {notes.length === 0 && (
             <div className="text-center text-muted-foreground py-8">No notes added yet.</div>
        )}
        {notes.map((note) => (
          <div key={note.id} className="flex gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={note.user.avatarUrl} alt={note.user.name} data-ai-hint="person face" />
              <AvatarFallback>{note.user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 rounded-lg border bg-card p-3">
              <div className="flex items-center justify-between">
                <p className="font-medium text-sm">{note.user.name}</p>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(parseISO(note.timestamp), { addSuffix: true })}
                </p>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{note.content}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
