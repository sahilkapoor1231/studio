'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Note } from '@/lib/types'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { formatDistanceToNow, parseISO } from 'date-fns'
import { Textarea } from '../ui/textarea'
import { Button } from '../ui/button'
import { User, Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { addNote } from '@/lib/data'

export function NotesFeed({ notes, leadId, isReadOnly }: { notes: Note[], leadId: string, isReadOnly?: boolean }) {
  const [newNote, setNewNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleNoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim() || isReadOnly) return;

    setIsSubmitting(true);
    try {
      // In a real app, the current user ID would come from an auth context
      await addNote(leadId, newNote, 'user-2'); 
      setNewNote('');
      toast({
        title: "Note added",
        description: "Your note has been saved successfully.",
      })
      router.refresh(); // Refresh the page to show the new note
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add note. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      {!isReadOnly && (
        <form onSubmit={handleNoteSubmit}>
            <Textarea 
            placeholder="Add an internal note... Use @ to mention a team member."
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            disabled={isSubmitting}
            />
            <Button type="submit" className="mt-2" disabled={isSubmitting || !newNote.trim()}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Add Note
            </Button>
        </form>
      )}
      <div className="space-y-4">
        {notes.length === 0 && (
             <div className="text-center text-muted-foreground py-8">No notes added yet.</div>
        )}
        {notes.map((note) => (
          <div key={note.id} className="flex gap-3">
            <Avatar className="h-8 w-8">
              {note.user ? (
                <>
                  <AvatarImage src={note.user.avatarUrl} alt={note.user.name} data-ai-hint="person face" />
                  <AvatarFallback>{note.user.name.charAt(0)}</AvatarFallback>
                </>
              ) : (
                <AvatarFallback><User className="h-5 w-5" /></AvatarFallback>
              )}
            </Avatar>
            <div className="flex-1 rounded-lg border bg-card p-3">
              <div className="flex items-center justify-between">
                <p className="font-medium text-sm">{note.user ? note.user.name : 'System'}</p>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(parseISO(note.timestamp), { addSuffix: true })}
                </p>
              </div>
              <p className="mt-1 text-sm text-muted-foreground" dangerouslySetInnerHTML={{ __html: note.content.replace(/\n/g, '<br />') }}></p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
