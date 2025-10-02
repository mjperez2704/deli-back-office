import type React from "react"
import { Suspense } from "react"
import { Analytics } from "@vercel/analytics/next"
import { Sidebar } from "@/components/sidebar"
import { Toaster } from "@/components/ui/toaster"

export function LayoutClient({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">
          <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
        </main>
      </div>
      <Toaster />
      <Analytics />
    </>
  )
}
