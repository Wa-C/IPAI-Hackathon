'use client'

import { useState, type ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { Topbar } from '@/components/topbar'
import { cn } from '@/lib/utils'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import {
  LayoutDashboard,
  BookOpen,
  Users,
  BarChart3,
  Settings,
  GraduationCap,
  Sparkles,
  FlaskConical,
  BookMarked,
  Target,
  SlidersHorizontal,
  Trophy,
  Zap,
} from 'lucide-react'

interface NavItem {
  label: string
  href: string
  icon: ReactNode
  badge?: string
}

const teacherNavItems: NavItem[] = [
  { label: 'Dashboard', href: '/teacher/dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
  { label: 'Classes', href: '/teacher/classes', icon: <GraduationCap className="h-5 w-5" /> },
  { label: 'Lesson Builder', href: '/teacher/lesson-builder', icon: <BookOpen className="h-5 w-5" />, badge: 'AI' },
  { label: 'Bias Scanner', href: '/teacher/bias-scanner', icon: <Sparkles className="h-5 w-5" />, badge: 'New' },
  { label: 'Students', href: '/teacher/students', icon: <Users className="h-5 w-5" /> },
  { label: 'Analytics', href: '/teacher/analytics', icon: <BarChart3 className="h-5 w-5" /> },
  { label: 'Fairness Lab', href: '/teacher/fairness-lab', icon: <FlaskConical className="h-5 w-5" /> },
  { label: 'Settings', href: '/teacher/settings', icon: <Settings className="h-5 w-5" /> },
]

const studentNavItems: NavItem[] = [
  { label: 'Dashboard', href: '/student/dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
  { label: 'My Lessons', href: '/student/lessons', icon: <BookMarked className="h-5 w-5" /> },
  { label: 'Achievements', href: '/student/achievements', icon: <Trophy className="h-5 w-5" /> },
  { label: 'Progress', href: '/student/progress', icon: <Target className="h-5 w-5" /> },
  { label: 'Preferences', href: '/student/preferences', icon: <SlidersHorizontal className="h-5 w-5" /> },
]

const adminNavItems: NavItem[] = [
  { label: 'Dashboard', href: '/admin/dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
  { label: 'Users', href: '/admin/users', icon: <Users className="h-5 w-5" /> },
  { label: 'Integrations', href: '/admin/integrations', icon: <Zap className="h-5 w-5" /> },
  { label: 'Settings', href: '/admin/settings', icon: <Settings className="h-5 w-5" /> },
]

function Sidebar({ items, className }: { items: NavItem[]; className?: string }) {
  const pathname = usePathname()

  return (
    <nav className={cn('flex flex-col gap-1.5 p-4', className)}>
      {items.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-3 rounded-[1.5rem] px-5 py-3.5 text-base transition-all duration-300',
              'hover:bg-white/5 hover:text-white hover:scale-[1.02]',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0066FF]',
              isActive
                ? 'bg-[#0066FF] text-white shadow-[0_0_20px_rgba(0,102,255,0.4)] font-bold'
                : 'text-[#94A3B8] font-medium'
            )}
          >
            <span className={cn(isActive ? 'text-white' : 'text-[#94A3B8] transition-colors group-hover:text-white')}>
              {item.icon}
            </span>
            <span className="flex-1">{item.label}</span>
            {item.badge && (
              <Badge 
                variant={isActive ? "secondary" : "outline"} 
                className={cn(
                  "text-xs px-2 py-0 h-5 rounded-full",
                  isActive ? "bg-white/20 text-white border-0" : ""
                )}
              >
                {item.badge}
              </Badge>
            )}
          </Link>
        )
      })}
    </nav>
  )
}

interface AppShellProps {
  children: ReactNode
}

export function AppShell({ children }: AppShellProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { user } = useAuth()
  const pathname = usePathname()

  const getNavItems = () => {
    if (pathname.startsWith('/admin')) return adminNavItems
    if (user?.role === 'teacher') return teacherNavItems
    return studentNavItems
  }

  const navItems = getNavItems()

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Topbar onMenuClick={() => setMobileMenuOpen(true)} showMenuButton />
      
      <div className="flex flex-1">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex w-64 flex-col border-r-0 bg-[#1E293B] text-[#94A3B8] z-10 shadow-[20px_0_50px_rgba(30,41,59,0.1)] relative">
          <Sidebar items={navItems} />
          
          {/* Pro upgrade card */}
          {user?.role === 'teacher' && (
            <div className="mt-auto p-6">
              <div className="rounded-[2.5rem] bg-white/5 border border-white/10 p-6 text-white shadow-[0_8px_30px_rgba(30,41,59,0.2)]">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-xl bg-[#0066FF]/20">
                    <Zap className="h-5 w-5 text-[#0066FF]" />
                  </div>
                  <span className="font-black text-lg">Go Pro</span>
                </div>
                <p className="text-xs text-white/80 mb-3">
                  Unlock unlimited AI generations and advanced analytics.
                </p>
                <button className="w-full py-2 rounded-full bg-white/20 hover:bg-white/30 text-sm font-bold transition-colors shadow-sm">
                  Upgrade Now
                </button>
              </div>
            </div>
          )}
        </aside>

        {/* Mobile Sidebar */}
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetContent side="left" className="w-72 p-0 bg-[#1E293B] border-r-0 text-[#94A3B8]">
            <div className="pt-12">
              <Sidebar items={navItems} />
            </div>
          </SheetContent>
        </Sheet>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto p-4 lg:p-8 max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
