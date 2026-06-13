"use client"

import * as React from "react"
import { useToast } from "@/components/ui/toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Modal } from "@/components/ui/modal"
import { Badge } from "@/components/ui/badge"
import { Plus, UserCog } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useRouter } from "next/navigation"
import { inviteUserAction } from "./actions"

export function AccessClient({ initialUsers, clients }: any) {
  const router = useRouter()
  const { toast } = useToast()
  
  const [isInviteModalOpen, setIsInviteModalOpen] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)

  // Form state
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [clientId, setClientId] = React.useState("")
  const [role, setRole] = React.useState("member")

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // For admins, client ID can be empty, but for owner/member it should be required
    if (role !== "admin" && !clientId) {
      toast("Please select a client workspace for non-admin users.")
      setIsLoading(false)
      return
    }

    const res = await inviteUserAction(email, clientId, role, password || undefined)
    
    setIsLoading(false)

    if (res.error) {
      toast(`Failed: ${res.error}`)
    } else {
      toast("Invite sent successfully.")
      setIsInviteModalOpen(false)
      // Reset form
      setEmail("")
      setPassword("")
      setClientId("")
      setRole("member")
      router.refresh()
    }
  }

  return (
    <div className="fade-in space-y-6">
      {/* Security callout banner */}
      <div className="rounded-lg border border-[#E2D2B5] bg-[var(--color-amber-soft)] p-4 text-sm text-[var(--color-amber)] shadow-sm">
        <strong>Isolation by design.</strong> A user can only ever load documents tied to their own workspace &mdash; enforced in the database, not just hidden in the UI.
      </div>

      <div className="flex items-center justify-between">
        <h2 className="font-serif text-2xl font-semibold text-[var(--color-ink)]">Access Management</h2>
        <Button onClick={() => setIsInviteModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Invite user
        </Button>
      </div>

      <div className="rounded-[var(--radius-md)] border border-[var(--color-line)] bg-[var(--color-surface)] shadow-[var(--shadow-sh1)] overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Client workspace</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {initialUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-[var(--color-ink3)] h-24">
                  No users found.
                </TableCell>
              </TableRow>
            ) : (
              initialUsers.map((user: any) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium text-[var(--color-ink)]">
                    <div className="flex items-center gap-2">
                      <UserCog className="h-4 w-4 text-[var(--color-ink3)]" />
                      {user.email}
                    </div>
                  </TableCell>
                  <TableCell className="text-[var(--color-ink2)]">
                    {user.role === "admin" ? <span className="text-[var(--color-ink3)] italic">System wide</span> : user.clientName}
                  </TableCell>
                  <TableCell className="text-[var(--color-ink2)] capitalize">{user.role}</TableCell>
                  <TableCell>
                    {user.status === "Active" ? (
                      <Badge variant="active">Active</Badge>
                    ) : (
                      <Badge variant="pending">Invite pending</Badge>
                    )}
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

      <Modal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        title="Invite user"
        description="Send an invitation to access the document portal."
      >
        <form onSubmit={handleInvite} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-[var(--color-ink2)]">Email address</label>
            <Input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="user@client.com" disabled={isLoading} />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-[var(--color-ink2)]">Initial Password (Optional)</label>
            <Input type="text" value={password} onChange={e => setPassword(e.target.value)} placeholder="Leave blank to send email invite" disabled={isLoading} />
            <p className="text-xs text-[var(--color-ink3)]">If provided, the user is created immediately and can log in with this password.</p>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-[var(--color-ink2)]">Role</label>
            <select 
              className="flex h-10 w-full rounded-md border border-[var(--color-line)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-ink)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)] focus:border-[var(--color-accent)]"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              required
              disabled={isLoading}
            >
              <option value="member">Member</option>
              <option value="owner">Owner</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {role !== "admin" && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--color-ink2)]">Client workspace</label>
              <select 
                className="flex h-10 w-full rounded-md border border-[var(--color-line)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-ink)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)] focus:border-[var(--color-accent)]"
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                required={role !== "admin"}
                disabled={isLoading}
              >
                <option value="" disabled>Select a workspace</option>
                {clients.map((c: any) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          )}
          
          <div className="pt-2 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setIsInviteModalOpen(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Sending..." : "Send invite"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
