import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { AdminNav } from "./admin-nav"
import { SignOutButton } from "./sign-out-button"

export const dynamic = "force-dynamic"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/")
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (profile?.role !== "admin") {
    redirect("/portal")
  }

  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-surface2)]">
      <header className="sticky top-0 z-30 border-b border-[var(--color-line)] bg-[var(--color-surface)]">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div>
              <h1 className="font-serif text-lg font-semibold text-[var(--color-ink)] leading-tight">
                MyProBuddy &middot; Admin
              </h1>
              <p className="text-xs text-[var(--color-ink3)]">
                Document control &amp; access management
              </p>
            </div>
            <div className="flex items-center gap-2">
              <a 
                href="/portal" 
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--color-accent)] disabled:pointer-events-none disabled:opacity-50 border border-[var(--color-line)] bg-transparent shadow-sm hover:bg-[var(--color-surface2)] hover:text-[var(--color-ink)] h-8 px-3"
              >
                Preview portal
              </a>
              <SignOutButton />
            </div>
          </div>
          <AdminNav />
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  )
}
