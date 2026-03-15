'use client'

import { useAuth } from '@/lib/auth-context'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { 
  BookOpen, 
  FlaskConical, 
  Globe, 
  Music, 
  Palette, 
  Play, 
  Calculator,
  Heart,
  Share2,
  TrendingUp,
  Award,
  Plus,
  Search
} from 'lucide-react'
import Link from 'next/link'
import { Input } from '@/components/ui/input'

const categories = [
  { name: 'Mathematics', icon: Calculator, color: 'text-[#0066FF]', bg: 'bg-[#0066FF]/10 hover:bg-[#0066FF]/20' },
  { name: 'Languages', icon: Globe, color: 'text-blue-500', bg: 'bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/30' },
  { name: 'Sciences', icon: FlaskConical, color: 'text-emerald-500', bg: 'bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-900/30' },
  { name: 'Literature', icon: BookOpen, color: 'text-indigo-500', bg: 'bg-indigo-100 hover:bg-indigo-200 dark:bg-indigo-900/30' },
  { name: 'Arts', icon: Palette, color: 'text-pink-500', bg: 'bg-pink-100 hover:bg-pink-200 dark:bg-pink-900/30' },
  { name: 'Music', icon: Music, color: 'text-cyan-500', bg: 'bg-cyan-100 hover:bg-cyan-200 dark:bg-cyan-900/30' },
]

const trendingNotes = [
  {
    id: 1,
    title: 'Complete Guide to Derivatives 📈',
    author: 'MathGenius22',
    initials: 'MG',
    likes: 1205,
    color: 'bg-blue-100 dark:bg-blue-900/20',
    height: 'min-h-[250px]'
  },
  {
    id: 2,
    title: 'Photosynthesis Summary Map 🌿',
    author: 'BioLover',
    initials: 'BL',
    likes: 892,
    color: 'bg-[#0066FF]/10 text-[#0066FF]',
    height: 'min-h-[180px]'
  },
  {
    id: 3,
    title: 'French Irregular Verbs Cheat Sheet 🇫🇷',
    author: 'ParisianDream',
    initials: 'PD',
    likes: 3400,
    color: 'bg-slate-100 text-slate-500',
    height: 'min-h-[220px]'
  },
  {
    id: 4,
    title: 'World War II Timeline ⚔️',
    author: 'HistoryBuff',
    initials: 'HB',
    likes: 671,
    color: 'bg-[#0066FF]/10 text-[#0066FF]',
    height: 'min-h-[280px]'
  },
  {
    id: 5,
    title: 'Newton\'s Laws Physics Notes 🍎',
    author: 'PhysicsNerd',
    initials: 'PN',
    likes: 1540,
    color: 'bg-slate-100 text-slate-500',
    height: 'min-h-[190px]'
  },
  {
    id: 6,
    title: 'Romeo & Juliet Character Map 🎭',
    author: 'LitFanatic',
    initials: 'LF',
    likes: 532,
    color: 'bg-[#0066FF]/10 text-[#0066FF]',
    height: 'min-h-[200px]'
  }
]

const topKnowers = [
  { name: 'Sarah M.', points: '12.4k', badge: 'Math Ace', initials: 'SM', color: 'bg-[#0066FF]' },
  { name: 'Julian R.', points: '10.2k', badge: 'History Buff', initials: 'JR', color: 'bg-slate-500' },
  { name: 'Emilia T.', points: '9.8k', badge: 'Science Pro', initials: 'ET', color: 'bg-[#0066FF]' },
  { name: 'Leo K.', points: '8.5k', badge: 'Polyglot', initials: 'LK', color: 'bg-slate-400' },
  { name: 'Mia S.', points: '7.9k', badge: 'Art Master', initials: 'MS', color: 'bg-slate-300' },
]

export default function StudentDashboard() {
  const { user } = useAuth()
  
  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8">
      <div className="space-y-10 max-w-[1400px] mx-auto px-6 pb-10">
        
        {/* Top Header: Pure White */}
        <div className="bg-white/60 backdrop-blur-md rounded-[3rem] p-8 md:px-12 shadow-[0_20px_50px_rgba(0,102,255,0.05)] border border-white/80 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
          <div className="relative z-10">
            <h1 className="text-4xl lg:text-5xl font-black tracking-tight text-foreground mb-2">
              Hi, {user?.name?.split(' ')[0] || 'Community'}! 👋
            </h1>
            <p className="text-muted-foreground font-medium text-lg">
              Ready to find the best study notes for your next exam?
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto relative z-10">
            {/* Search Bar */}
            <div className="relative w-full sm:w-72 lg:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input 
                placeholder="Search subjects, topics..." 
                className="w-full h-14 pl-12 pr-4 rounded-full border-border/50 bg-white focus-visible:ring-[#0066FF] shadow-sm text-base"
              />
            </div>
            
            <Button 
              className="h-14 text-white rounded-full font-bold shadow-blue-500/30 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all px-8 gap-2 shrink-0 text-base"
              style={{ backgroundColor: '#0066FF' }}
            >
              <Plus className="w-5 h-5" />
              Upload Notes
            </Button>
          </div>
          
          {/* Decorative background element */}
          <div className="absolute right-0 top-0 w-64 h-64 bg-[#0066FF]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        </div>

      {/* Horizontal Scrolling Category Picker (Pill-Shaped) */}
      <section>
        <div className="w-full overflow-x-auto pb-4 hide-scrollbar">
          <div className="flex gap-4 snap-x pr-4 w-max items-center">
            {categories.map((cat) => (
              <button 
                key={cat.name}
                className={`snap-start flex flex-row items-center gap-3 px-6 py-3.5 rounded-full cursor-pointer transition-all border-0 shadow-blue-500/5 shadow-md bg-[#F8FAFF] hover:-translate-y-0.5`}
              >
                <div className={`p-1.5 rounded-full ${cat.bg}`}>
                  <cat.icon className={`w-5 h-5 ${cat.color}`} />
                </div>
                <span className="font-bold text-base text-black">{cat.name}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Left Column: Pinterest-Style Masonry Grid */}
        <div className="lg:col-span-3 space-y-6">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl lg:text-4xl font-black flex items-center gap-3 text-black">
              <TrendingUp className="text-[#0066FF] w-8 h-8" />
              Trending Notes
            </h2>
          </div>
          
          {/* CSS Columns Approach for Masonry: 2 columns on tablet, 3 on desktop */}
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
            {trendingNotes.map((note) => (
              <div 
                key={note.id} 
                className={`break-inside-avoid relative rounded-[3rem] p-6 transition-transform hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(0,102,255,0.12)] cursor-pointer flex flex-col justify-between bg-white shadow-[0_20px_50px_rgba(0,102,255,0.05)] border border-white/80 ${note.height}`}
              >
                {/* Note Content */}
                <div>
                  <div className={`w-12 h-12 rounded-2xl ${note.color} mb-4 flex items-center justify-center`}>
                    <BookOpen className="w-6 h-6 text-[#0066FF]" />
                  </div>
                  <h3 className="text-xl font-black text-black leading-snug text-balance mb-4">
                    {note.title}
                  </h3>
                </div>
                
                {/* Note Actions / Author (Bottom pinned) */}
                <div className="flex items-center justify-between mt-6 bg-white p-2 pl-3 rounded-full shadow-sm">
                  <div className="flex items-center gap-2">
                    <Avatar className="w-8 h-8 border-2 border-white">
                      <AvatarFallback className="bg-[#0066FF] text-white text-[10px] font-bold">
                        {note.initials}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs font-bold text-black truncate max-w-[80px]">
                      {note.author}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 pr-2 text-black/60">
                    <Heart className="w-4 h-4 fill-transparent hover:fill-red-500 hover:text-red-500 transition-colors" />
                    <span className="text-xs font-bold">{note.likes}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Community Sidebar (Midnight Slate) */}
        <div className="space-y-6">
          {/* Top Knowers Leaderboard */}
          <Card className="border-0 shadow-2xl overflow-hidden rounded-[3rem] bg-[#1E293B] text-white">
            <CardHeader className="bg-white/5 pb-6 border-b border-white/10">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-3 text-2xl font-black">
                  <div className="p-2 bg-[#0066FF]/20 rounded-xl">
                    <Award className="text-[#0066FF] w-6 h-6" />
                  </div>
                  Top Knowers
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-white/5">
                {topKnowers.map((user, i) => (
                  <div key={user.name} className="flex items-center justify-between p-5 hover:bg-white/5 transition-colors group cursor-pointer">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <Avatar className={`h-12 w-12 border-2 border-[#1E293B] ${i < 3 ? 'ring-2 ring-[#0066FF] ring-offset-2 ring-offset-[#1E293B] shadow-[0_0_15px_rgba(0,102,255,0.4)]' : ''}`}>
                          <AvatarFallback className={`text-white font-bold text-lg ${user.color}`}>{user.initials}</AvatarFallback>
                        </Avatar>
                        {i === 0 && (
                          <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full border-2 border-[#1E293B] flex items-center justify-center text-xs shadow-lg">
                            👑
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-base text-white group-hover:text-[#0066FF] transition-colors">{user.name}</p>
                        <p className="text-sm text-[#94A3B8] font-medium">{user.badge}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <Badge variant="secondary" className="bg-[#0066FF]/20 text-[#0066FF] group-hover:bg-[#0066FF] group-hover:text-white transition-colors rounded-full font-bold shadow-none px-3 py-1">
                        {user.points}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-6 border-t border-white/10 bg-white/5 text-center">
                <Button variant="ghost" className="text-base font-bold text-[#0066FF] hover:text-white hover:bg-[#0066FF]/20 rounded-full w-full h-12">
                  View Full Leaderboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        </div>
      </div>
    </div>
  )
}
