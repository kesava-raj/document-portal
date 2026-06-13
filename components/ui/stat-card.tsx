import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "./card"
import { cn } from "@/lib/utils"

interface StatCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  value: string | number
  accent?: boolean
}

export function StatCard({ title, value, accent, className, ...props }: StatCardProps) {
  return (
    <Card className={cn(accent && "border-t-4 border-t-[var(--color-accent)]", className)} {...props}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-sans font-medium text-[var(--color-ink2)]">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-serif text-[var(--color-ink)]">{value}</div>
      </CardContent>
    </Card>
  )
}
