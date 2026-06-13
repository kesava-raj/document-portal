"use client"

import * as React from "react"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/components/ui/toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Modal } from "@/components/ui/modal"
import { Badge } from "@/components/ui/badge"
import { AvatarInitials } from "@/components/ui/avatar-initials"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Plus } from "lucide-react"
import { useRouter } from "next/navigation"
import { createClientWithUserAction, updateClientAction } from "./actions"

export function ClientsClient({ initialClients }: { initialClients: any[] }) {
  const router = useRouter()
  const supabase = createClient()
  const { toast } = useToast()
  
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false)
  const [editingClientId, setEditingClientId] = React.useState<string | null>(null)
  const [isLoading, setIsLoading] = React.useState(false)

  // Form state
  const [name, setName] = React.useState("")
  const [platform, setPlatform] = React.useState("")
  const [sector, setSector] = React.useState("")
  const [logoFile, setLogoFile] = React.useState<File | null>(null)
  const [shortCode, setShortCode] = React.useState("")
  const [phone, setPhone] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")

  const handleAddClient = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    let logoUrl: string | null = null;

    if (logoFile) {
      const fileExt = logoFile.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('logos')
        .upload(fileName, logoFile);

      if (uploadError) {
        toast("Failed to upload logo.");
        console.error(uploadError);
        setIsLoading(false);
        return;
      }
      
      const { data: publicUrlData } = supabase.storage.from('logos').getPublicUrl(fileName);
      logoUrl = publicUrlData.publicUrl;
    }

    const result = await createClientWithUserAction(
      { name, platform, sector, short_code: shortCode.toUpperCase().substring(0, 2), logo_url: logoUrl, phone },
      { email, password: password || undefined }
    )

    setIsLoading(false)

    if (result.error) {
      toast(`Failed to add client: ${result.error}`)
    } else {
      toast("Client and initial user added successfully.")
      setIsAddModalOpen(false)
      // Reset form
      setName("")
      setPlatform("")
      setSector("")
      setLogoFile(null)
      setShortCode("")
      setPhone("")
      setEmail("")
      setPassword("")
      router.refresh()
    }
  }

  const handleEditClick = (client: any) => {
    setEditingClientId(client.id)
    setName(client.name)
    setPlatform(client.platform)
    setSector(client.sector || "")
    setShortCode(client.short_code)
    setPhone(client.phone || "")
    setLogoFile(null)
    setIsEditModalOpen(true)
  }

  const handleUpdateClient = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingClientId) return
    setIsLoading(true)

    let logoUrl: string | undefined = undefined;

    if (logoFile) {
      const fileExt = logoFile.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('logos')
        .upload(fileName, logoFile);

      if (uploadError) {
        toast("Failed to upload logo.");
        console.error(uploadError);
        setIsLoading(false);
        return;
      }
      
      const { data: publicUrlData } = supabase.storage.from('logos').getPublicUrl(fileName);
      logoUrl = publicUrlData.publicUrl;
    }

    const result = await updateClientAction(editingClientId, { 
      name, 
      platform, 
      sector, 
      short_code: shortCode.toUpperCase().substring(0, 2), 
      logo_url: logoUrl, 
      phone 
    })

    setIsLoading(false)

    if (result.error) {
      toast(`Failed to update client: ${result.error}`)
    } else {
      toast("Client updated successfully.")
      setIsEditModalOpen(false)
      setEditingClientId(null)
      // Reset form
      setName("")
      setPlatform("")
      setSector("")
      setLogoFile(null)
      setShortCode("")
      setPhone("")
      router.refresh()
    }
  }

  return (
    <div className="fade-in space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-2xl font-semibold text-[var(--color-ink)]">Clients</h2>
        <Button onClick={() => setIsAddModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add client
        </Button>
      </div>

      <div className="rounded-[var(--radius-md)] border border-[var(--color-line)] bg-[var(--color-surface)] shadow-[var(--shadow-sh1)]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Client</TableHead>
              <TableHead>Platform</TableHead>
              <TableHead>Docs</TableHead>
              <TableHead>Manuals ready</TableHead>
              <TableHead>Login status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {initialClients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-[var(--color-ink3)] h-24">
                  No clients found.
                </TableCell>
              </TableRow>
            ) : (
              initialClients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <AvatarInitials initials={client.short_code} logoUrl={client.logo_url} size="sm" />
                      <div>
                        <p className="font-medium text-[var(--color-ink)]">{client.name}</p>
                        <p className="text-xs text-[var(--color-ink3)]">{client.sector || "No sector"}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-[var(--color-ink2)]">{client.platform}</TableCell>
                  <TableCell className="font-mono text-[var(--color-ink2)]">{client.docsCount}</TableCell>
                  <TableCell className="font-mono text-[var(--color-ink2)]">{client.readyCount} / {client.docsCount}</TableCell>
                  <TableCell>
                    {client.hasLogin ? (
                      <Badge variant="active">Active</Badge>
                    ) : (
                      <Badge variant="pending">No login</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => handleEditClick(client)}>
                      Manage
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add new client"
        description="Create a new workspace for a client."
      >
        <form onSubmit={handleAddClient} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-[var(--color-ink2)]">Client name</label>
            <Input required value={name} onChange={e => setName(e.target.value)} placeholder="e.g. CataLab Solutions" disabled={isLoading} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-[var(--color-ink2)]">Platform name</label>
            <Input required value={platform} onChange={e => setPlatform(e.target.value)} placeholder="e.g. TAP" disabled={isLoading} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--color-ink2)]">Sector</label>
              <Input value={sector} onChange={e => setSector(e.target.value)} placeholder="e.g. GovTech" disabled={isLoading} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--color-ink2)]">Short code</label>
              <Input required value={shortCode} onChange={e => setShortCode(e.target.value)} placeholder="e.g. CL" maxLength={2} disabled={isLoading} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--color-ink2)]">Upload Logo</label>
              <Input type="file" accept="image/*" onChange={e => setLogoFile(e.target.files?.[0] || null)} disabled={isLoading} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--color-ink2)]">Phone number</label>
              <Input required value={phone} onChange={e => setPhone(e.target.value)} placeholder="e.g. +1 234 567 890" disabled={isLoading} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--color-ink2)]">Client Admin Email</label>
              <Input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@client.com" disabled={isLoading} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--color-ink2)]">Initial Password</label>
              <Input type="text" value={password} onChange={e => setPassword(e.target.value)} placeholder="Optional password" disabled={isLoading} />
            </div>
          </div>
          <div className="pt-2 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save client"}
            </Button>
          </div>
        </form>
      </Modal>
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit client"
        description="Update client workspace details."
      >
        <form onSubmit={handleUpdateClient} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-[var(--color-ink2)]">Client name</label>
            <Input required value={name} onChange={e => setName(e.target.value)} placeholder="e.g. CataLab Solutions" disabled={isLoading} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-[var(--color-ink2)]">Platform name</label>
            <Input required value={platform} onChange={e => setPlatform(e.target.value)} placeholder="e.g. TAP" disabled={isLoading} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--color-ink2)]">Sector</label>
              <Input value={sector} onChange={e => setSector(e.target.value)} placeholder="e.g. GovTech" disabled={isLoading} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--color-ink2)]">Short code</label>
              <Input required value={shortCode} onChange={e => setShortCode(e.target.value)} placeholder="e.g. CL" maxLength={2} disabled={isLoading} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--color-ink2)]">Upload New Logo</label>
              <Input type="file" accept="image/*" onChange={e => setLogoFile(e.target.files?.[0] || null)} disabled={isLoading} />
              <p className="text-xs text-[var(--color-ink3)]">Leave empty to keep existing logo</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--color-ink2)]">Phone number</label>
              <Input required value={phone} onChange={e => setPhone(e.target.value)} placeholder="e.g. +1 234 567 890" disabled={isLoading} />
            </div>
          </div>
          <div className="pt-2 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save changes"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
