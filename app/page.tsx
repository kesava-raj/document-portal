"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Lock, AlertCircle } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function SignInPage() {
  const router = useRouter()
  const supabase = createClient()
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [error, setError] = React.useState<string | null>(null)
  const [isLoading, setIsLoading] = React.useState(false)

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (signInError) {
      setIsLoading(false)
      // Generic error message as per requirements
      setError("Invalid email or password. Please check your credentials and try again.")
      return
    }

    // Determine role and redirect
    if (data.user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role, client_id")
        .eq("id", data.user.id)
        .single()

      if (profile?.role === "admin") {
        router.push("/admin")
      } else if (profile?.client_id) {
        router.push("/portal")
      } else {
        // Active status check handled here or via RLS
        setError("Your account does not have an assigned workspace. Please contact support.")
        await supabase.auth.signOut()
        setIsLoading(false)
      }
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-[430px] fade-in">
        <Card className="shadow-sh2">
          <CardHeader className="items-center text-center space-y-4 pb-6 pt-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-accent)] text-white shadow-sm">
              <Lock className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <CardTitle className="text-2xl">Client Document Portal</CardTitle>
              <CardDescription>Secure access to your platform documentation</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignIn} className="space-y-4">
              {error && (
                <div className="flex items-center gap-2 rounded-md bg-[var(--color-red-soft)] p-3 text-sm text-[var(--color-red)]">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <p>{error}</p>
                </div>
              )}
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-[var(--color-ink2)]" htmlFor="email">
                  Work email
                </label>
                <Input
                  id="email"
                  type="email"
                  required
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-[var(--color-ink2)]" htmlFor="password">
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <Button
                type="submit"
                className="w-full mt-2"
                size="lg"
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Sign in"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="justify-center border-t border-[var(--color-line)] bg-[var(--color-surface2)] p-4 rounded-b-[var(--radius-md)]">
            <p className="text-center text-xs text-[var(--color-ink3)] max-w-xs">
              Encrypted in transit & at rest &middot; DPDP Act 2023 aligned &middot; every access is audit-logged
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
