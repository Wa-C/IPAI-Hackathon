'use client'

import { AppShell } from '@/components/app-shell'
import { useAuth } from '@/lib/auth-context'
import { redirect } from 'next/navigation'
import { useEffect } from 'react'

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, isLoading } = useAuth()

  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'student')) {
      redirect('/auth/login')
    }
  }, [user, isLoading])

  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    )
  }

  return <AppShell>{children}</AppShell>
}
