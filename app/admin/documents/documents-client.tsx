"use client"

import * as React from "react"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/components/ui/toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Upload, File, MoreVertical, Search, FileText, Loader2, X } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useRouter } from "next/navigation"

export function DocumentsClient({ initialDocuments, clients, categories }: any) {
  const router = useRouter()
  const supabase = createClient()
  const { toast } = useToast()
  
  const [docs, setDocs] = React.useState(initialDocuments)
  const [isUploading, setIsUploading] = React.useState(false)
  const [filterQuery, setFilterQuery] = React.useState("")

  // Form State
  const [file, setFile] = React.useState<File | null>(null)
  const [clientId, setClientId] = React.useState("")
  const [categoryId, setCategoryId] = React.useState("")
  const [title, setTitle] = React.useState("")
  const [version, setVersion] = React.useState("v1.0")
  const [status, setStatus] = React.useState("Draft")

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0]
      setFile(selectedFile)
      if (!title) setTitle(selectedFile.name.split('.').slice(0, -1).join('.'))
    }
  }

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file || !clientId || !categoryId || !title || !version) {
      toast("Please fill all required fields and select a file.")
      return
    }

    setIsUploading(true)

    try {
      // Get user context for created_by
      const { data: { user } } = await supabase.auth.getUser()

      // 1. Generate ID
      const docId = crypto.randomUUID()
      const ext = file.name.split('.').pop()?.toUpperCase() || 'MD'
      const fileType = ['PDF', 'PNG', 'MD'].includes(ext) ? ext : 'MD'
      const storagePath = `${clientId}/${docId}/${file.name}`

      // 2. Upload file to Storage
      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(storagePath, file)

      if (uploadError) throw uploadError

      // 3. Insert into database
      const { error: dbError } = await supabase.from('documents').insert({
        id: docId,
        client_id: clientId,
        category_id: parseInt(categoryId),
        title,
        version,
        file_type: fileType,
        storage_path: storagePath,
        status,
        created_by: user?.id
      })

      if (dbError) {
        // Rollback storage on DB failure could go here
        throw dbError
      }

      toast("Document published successfully.")
      
      // Reset form
      setFile(null)
      setTitle("")
      setVersion("v1.0")
      setStatus("Draft")
      
      router.refresh()
    } catch (error: any) {
      console.error(error)
      toast(`Upload failed: ${error.message || 'Unknown error'}`)
    } finally {
      setIsUploading(false)
    }
  }

  const filteredDocs = docs.filter((d: any) => 
    d.title.toLowerCase().includes(filterQuery.toLowerCase()) ||
    d.clients?.name.toLowerCase().includes(filterQuery.toLowerCase())
  )

  return (
    <div className="fade-in space-y-8">
      {/* Upload Section */}
      <div className="rounded-[var(--radius-md)] border border-[var(--color-line)] bg-[var(--color-surface)] shadow-[var(--shadow-sh1)] overflow-hidden flex flex-col md:flex-row">
        
        {/* Dropzone Area */}
        <div className="flex-1 border-b md:border-b-0 md:border-r border-[var(--color-line)] p-8 flex flex-col items-center justify-center bg-[var(--color-surface2)]/50">
          <div className="relative group cursor-pointer flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-[var(--color-line2)] rounded-lg hover:border-[var(--color-accent)] hover:bg-[var(--color-surface)] transition-all w-full max-w-sm">
            <input 
              type="file" 
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
              accept=".pdf,.png,.md"
              onChange={handleFileChange}
              disabled={isUploading}
            />
            {file ? (
              <>
                <FileText className="h-10 w-10 text-[var(--color-accent)] mb-3" />
                <p className="text-sm font-medium text-[var(--color-ink)] truncate w-full px-4">{file.name}</p>
                <p className="text-xs text-[var(--color-ink3)] mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="mt-4 h-8"
                  onClick={(e) => { e.preventDefault(); setFile(null) }}
                >
                  <X className="mr-2 h-3.5 w-3.5" /> Remove
                </Button>
              </>
            ) : (
              <>
                <Upload className="h-10 w-10 text-[var(--color-ink4)] group-hover:text-[var(--color-accent)] mb-3 transition-colors" />
                <p className="text-sm font-medium text-[var(--color-ink)]">Click or drag file to this area</p>
                <p className="text-xs text-[var(--color-ink3)] mt-1">Accepts PDF, PNG, MD files only</p>
              </>
            )}
          </div>
        </div>

        {/* Upload Form Area */}
        <div className="flex-1 p-6 lg:p-8">
          <h3 className="font-serif text-lg font-medium text-[var(--color-ink)] mb-6">Document Details</h3>
          <form onSubmit={handleUpload} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-[var(--color-ink2)]">Assign to client</label>
                <select 
                  className="flex h-10 w-full rounded-md border border-[var(--color-line)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-ink)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)] focus:border-[var(--color-accent)]"
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  required
                  disabled={isUploading}
                >
                  <option value="" disabled>Select a workspace</option>
                  {clients.map((c: any) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-[var(--color-ink2)]">Category</label>
                <select 
                  className="flex h-10 w-full rounded-md border border-[var(--color-line)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-ink)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)] focus:border-[var(--color-accent)]"
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  required
                  disabled={isUploading}
                >
                  <option value="" disabled>Select category</option>
                  {categories.map((c: any) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--color-ink2)]">Document title</label>
              <Input 
                required 
                value={title} 
                onChange={e => setTitle(e.target.value)} 
                placeholder="e.g. Architecture Overview" 
                disabled={isUploading}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-[var(--color-ink2)]">Version</label>
                <Input 
                  required 
                  value={version} 
                  onChange={e => setVersion(e.target.value)} 
                  disabled={isUploading}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-[var(--color-ink2)]">Status</label>
                <select 
                  className="flex h-10 w-full rounded-md border border-[var(--color-line)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-ink)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)] focus:border-[var(--color-accent)]"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  required
                  disabled={isUploading}
                >
                  <option value="Draft">Draft (Hidden)</option>
                  <option value="Ready">Ready (Published)</option>
                </select>
              </div>
            </div>

            <Button type="submit" className="w-full mt-4" disabled={isUploading || !file}>
              {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
              Publish &amp; assign
            </Button>
          </form>
        </div>
      </div>

      {/* Documents Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-2xl font-semibold text-[var(--color-ink)]">All Documents</h2>
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-ink4)]" />
            <Input
              placeholder="Filter documents..."
              className="pl-9 h-9"
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="rounded-[var(--radius-md)] border border-[var(--color-line)] bg-[var(--color-surface)] shadow-[var(--shadow-sh1)]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Document</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Version</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDocs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-[var(--color-ink3)] h-24">
                    No documents found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredDocs.map((doc: any) => (
                  <TableRow key={doc.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <File className="h-4 w-4 text-[var(--color-ink3)]" />
                        <span className="font-medium text-[var(--color-ink)] max-w-[200px] truncate" title={doc.title}>{doc.title}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-[var(--color-ink2)]">{doc.clients?.name}</TableCell>
                    <TableCell className="text-[var(--color-ink2)]">{doc.categories?.name}</TableCell>
                    <TableCell className="font-mono text-[var(--color-ink2)]">{doc.version}</TableCell>
                    <TableCell>
                      <Badge variant={doc.status === 'Ready' ? 'ready' : 'draft'}>{doc.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => toast("Edit functionality to be implemented")}>
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
