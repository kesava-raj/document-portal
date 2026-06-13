"use client"

import * as React from "react"
import { Send, X, MessageSquare, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/supabase/client"
import { getSupportMessagesAction, sendSupportMessageAction } from "@/app/actions/support"
import { AvatarInitials } from "@/components/ui/avatar-initials"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

interface ActivityPanelProps {
  clientId: string
  clientName: string
  isOpen: boolean
  onClose: () => void
  currentUserId?: string // Optional, to align messages right/left if we want, but Activity feed usually is single column
}

export function ActivityPanel({ clientId, clientName, isOpen, onClose }: ActivityPanelProps) {
  const supabase = createClient()
  const [messages, setMessages] = React.useState<any[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [newMessage, setNewMessage] = React.useState("")
  const [isSending, setIsSending] = React.useState(false)
  const messagesEndRef = React.useRef<HTMLDivElement>(null)

  const loadMessages = async () => {
    setIsLoading(true)
    const result = await getSupportMessagesAction(clientId)
    if (result.success && result.messages) {
      setMessages(result.messages)
    }
    setIsLoading(false)
    scrollToBottom()
  }

  React.useEffect(() => {
    if (isOpen && clientId) {
      loadMessages()

      // Subscribe to real-time changes
      const channel = supabase.channel(`support-${clientId}`)
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'support_messages', filter: `client_id=eq.${clientId}` },
          (payload) => {
            setMessages((prev) => [...prev, payload.new])
            scrollToBottom()
          }
        )
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    }
  }, [isOpen, clientId])

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }, 100)
  }

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || isSending) return

    const content = newMessage.trim()
    setNewMessage("")
    setIsSending(true)

    // Optimistic update
    const tempId = `temp-${Date.now()}`
    const tempMsg = {
      id: tempId,
      client_id: clientId,
      sender_name: "Sending...",
      sender_role: "",
      content: content,
      created_at: new Date().toISOString()
    }
    setMessages(prev => [...prev, tempMsg])
    scrollToBottom()

    const result = await sendSupportMessageAction(clientId, content)
    
    if (result.error) {
      // Remove optimistic message
      setMessages(prev => prev.filter(m => m.id !== tempId))
      console.error(result.error)
    } else if (result.success && result.message) {
      // Replace optimistic message with real one
      setMessages(prev => prev.map(m => m.id === tempId ? result.message : m))
      scrollToBottom()
    }

    setIsSending(false)
  }

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-[var(--color-surface2)]/50 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div 
        className={cn(
          "fixed inset-y-0 right-0 z-50 w-full max-w-md bg-[var(--color-surface)] shadow-2xl transition-transform duration-300 ease-in-out flex flex-col border-l border-[var(--color-line)]",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex h-16 items-center justify-between px-6 border-b border-[var(--color-line)] bg-[var(--color-surface)]">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-[var(--color-ink)]" />
            <h2 className="font-serif text-lg font-medium text-[var(--color-ink)]">
              Activity
            </h2>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="-mr-2 h-8 w-8 p-0 rounded-full">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[var(--color-surface2)]/30">
          {isLoading ? (
            <div className="flex h-full items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-[var(--color-ink3)]" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center space-y-3 opacity-70">
              <MessageSquare className="h-10 w-10 text-[var(--color-ink3)]" />
              <p className="text-sm text-[var(--color-ink2)]">No activity yet.<br/>Send a message to start the conversation.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {messages.map((msg, idx) => {
                const showHeader = idx === 0 || messages[idx - 1].sender_id !== msg.sender_id || 
                  (new Date(msg.created_at).getTime() - new Date(messages[idx - 1].created_at).getTime() > 1000 * 60 * 30) // 30 min gap

                return (
                  <div key={msg.id} className="space-y-1 fade-in">
                    {showHeader && (
                      <div className="flex items-center gap-2 mb-2">
                        <AvatarInitials 
                          initials={msg.sender_name?.substring(0, 2).toUpperCase() || "??"} 
                          size="sm" 
                          // Highlight admins
                          className={msg.sender_role === 'admin' ? 'bg-[var(--color-ink)] text-white' : 'bg-[var(--color-accent)] text-white'}
                        />
                        <span className="text-sm font-semibold text-[var(--color-ink)]">
                          {msg.sender_name}
                        </span>
                        <span className="text-xs text-[var(--color-ink3)] ml-2">
                          {format(new Date(msg.created_at), "MMM d 'at' h:mm a")}
                        </span>
                      </div>
                    )}
                    <div className="pl-10">
                      <div className={cn(
                        "rounded-2xl px-4 py-2.5 text-sm inline-block shadow-sm",
                        msg.sender_role === 'admin' 
                          ? "bg-white border border-[var(--color-line)] text-[var(--color-ink)]" 
                          : "bg-[var(--color-surface)] border border-[var(--color-line)] text-[var(--color-ink)]"
                      )}>
                        {msg.content}
                      </div>
                    </div>
                  </div>
                )
              })}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        <div className="p-4 border-t border-[var(--color-line)] bg-[var(--color-surface)]">
          <form onSubmit={handleSend} className="flex items-end gap-2 relative">
            <div className="flex-1">
              <Input
                placeholder="Ask anything or leave a note..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                disabled={isSending}
                className="pr-10 py-6 bg-[var(--color-surface)]"
              />
            </div>
            <Button 
              type="submit" 
              size="sm" 
              disabled={!newMessage.trim() || isSending}
              className="absolute right-2 bottom-2 h-8 w-8 p-0 rounded-full bg-[var(--color-accent)] hover:bg-[var(--color-ink)] transition-colors"
            >
              {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </form>
        </div>
      </div>
    </>
  )
}
