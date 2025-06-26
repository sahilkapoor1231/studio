import { Document } from '@/lib/types'
import { Button } from '../ui/button'
import { Download, FileText, Paperclip, Trash2, UploadCloud } from 'lucide-react'
import { format, parseISO } from 'date-fns'

export function DocumentManager({ documents }: { documents: Document[] }) {
  return (
    <div className="space-y-6">
      <div className="rounded-lg border-2 border-dashed border-border p-6 text-center">
        <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-2 text-sm font-medium">Drag & drop files here</h3>
        <p className="mt-1 text-xs text-muted-foreground">or</p>
        <Button size="sm" variant="outline" className="mt-2">
            <Paperclip className="mr-2 h-4 w-4" />
            Browse Files
        </Button>
      </div>

       <div className="space-y-2">
        <h3 className="font-medium">Uploaded Documents</h3>
        {documents.length === 0 && (
             <div className="text-center text-muted-foreground py-8">No documents uploaded.</div>
        )}
        {documents.map(doc => (
            <div key={doc.id} className="flex items-center justify-between rounded-md border p-3">
                <div className="flex items-center gap-3">
                    <FileText className="h-6 w-6 text-primary" />
                    <div>
                        <p className="text-sm font-medium">{doc.name}</p>
                        <p className="text-xs text-muted-foreground">Uploaded on {format(parseISO(doc.uploadedAt), 'PPP')}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon">
                        <Download className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        ))}
       </div>
    </div>
  )
}
