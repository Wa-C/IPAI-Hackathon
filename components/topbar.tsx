'use client'

import { useAuth } from '@/lib/auth-context'
import { Logo } from '@/components/logo'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { useRouter } from 'next/navigation'
import { Menu, Settings, LogOut, User, Globe, Bell, Sparkles, Flame } from 'lucide-react'

interface TopbarProps {
  onMenuClick?: () => void
  showMenuButton?: boolean
}

export function Topbar({ onMenuClick, showMenuButton = false }: TopbarProps) {
  const { user, organisation, logout, language, setLanguage } = useAuth()
  const router = useRouter()

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const roleLabel = user?.role === 'teacher' ? 'Teacher' : 'Student'

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 glass">
      <div className="flex h-16 items-center gap-4 px-4 lg:px-6">
        {showMenuButton && (
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden rounded-xl"
            onClick={onMenuClick}
            aria-label="Toggle menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
        )}
        
        <Logo size="sm" />
        
        <div className="flex-1" />

        {organisation && (
          <div className="hidden md:flex items-center gap-3 px-4 py-2 rounded-xl bg-secondary/50">
            <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <span className="text-sm font-medium text-foreground">{organisation.name}</span>
          </div>
        )}

        {/* The Streak */}
        {user?.role === 'teacher' && (
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-[#0066FF]/20 shadow-sm cursor-default hover:shadow-md transition-all">
            <Flame className="w-4 h-4 text-[#0066FF] fill-[#0066FF]/20" />
            <span className="font-bold text-sm text-[#1E293B]">7</span>
          </div>
        )}

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="rounded-xl relative">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-accent" />
          <span className="sr-only">Notifications</span>
        </Button>

        {/* Language */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-xl">
              <Globe className="h-5 w-5" />
              <span className="sr-only">Change language</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="rounded-xl">
            <DropdownMenuLabel>Language</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setLanguage('en')} className="rounded-lg">
              English {language === 'en' && '✓'}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setLanguage('de')} className="rounded-lg">
              Deutsch {language === 'de' && '✓'}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-3 h-auto py-2 px-3 rounded-xl hover:bg-secondary/80">
                <Avatar className="h-9 w-9 ring-2 ring-primary/20">
                  <AvatarFallback className="gradient-primary text-white font-medium">
                    {getInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden sm:flex flex-col items-start gap-1">
                  <span className="text-sm font-semibold text-foreground">{user.name}</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-[10px] h-5 rounded-full px-2">
                      {roleLabel}
                    </Badge>
                    {user.role === 'teacher' && (
                      <Badge className="text-[10px] h-5 rounded-full px-2 bg-[#1E293B] text-[#0066FF] hover:bg-[#1E293B] border-0">
                        Level 4 Master
                      </Badge>
                    )}
                  </div>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-60 rounded-xl p-2">
              <DropdownMenuLabel className="px-3">
                <div className="flex flex-col">
                  <span className="font-semibold">{user.name}</span>
                  <span className="text-xs font-normal text-muted-foreground">{user.email}</span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => router.push(user.role === 'teacher' ? '/teacher/settings' : '/student/preferences')}
                className="rounded-lg py-2.5"
              >
                <User className="mr-3 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => router.push(user.role === 'teacher' ? '/teacher/settings' : '/student/preferences')}
                className="rounded-lg py-2.5"
              >
                <Settings className="mr-3 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              {user.role === 'teacher' && (
                <DropdownMenuItem 
                  onClick={() => router.push('/teacher/lesson-builder')}
                  className="rounded-lg py-2.5"
                >
                  <Sparkles className="mr-3 h-4 w-4" />
                  AI Assistant
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-destructive rounded-lg py-2.5">
                <LogOut className="mr-3 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  )
}
