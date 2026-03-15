'use client'

import Link from 'next/link'
import { Logo } from '@/components/logo'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  BookOpen,
  Users,
  Shield,
  Sparkles,
  Play,
  ArrowRight,
  CheckCircle2,
  Globe,
  Zap,
  Brain,
  Target,
  Award,
  TrendingUp,
  MessageCircle,
  Star,
} from 'lucide-react'

const stats = [
  { value: '12+', label: 'Pilots' },
  { value: '1.2k+', label: 'Users' },
  { value: '94%', label: 'Retention' },
  { value: '15h', label: 'Saved/Week' },
]

const features = [
  {
    icon: Brain,
    title: 'AI Lesson Builder',
    description: 'Generate differentiated content in seconds with smart AI that understands curriculum standards.',
  },
  {
    icon: Target,
    title: 'Adaptive Learning',
    description: 'Every student gets personalized pathways based on their learning style and pace.',
  },
  {
    icon: Shield,
    title: 'Bias Scanner',
    description: 'Automatically detect and fix cultural, gender, and accessibility bias in your materials.',
  },
  {
    icon: Award,
    title: 'Gamification',
    description: 'Keep students engaged with achievements, streaks, and collaborative challenges.',
  },
]

const learningModes = [
  { icon: BookOpen, label: 'Read', description: 'Traditional text-based learning' },
  { icon: Play, label: 'Play', description: 'Interactive games and quizzes' },
  { icon: MessageCircle, label: 'Watch', description: 'Video explanations' },
]

const testimonials = [
  {
    quote: "COPA has transformed how my students practice conversation.",
    author: "Maria K.",
    role: "Mathematics Teacher, Berlin",
    avatar: "MK",
  },
  {
    quote: "COPA has transformed how my students practice conversation.",
    author: "Thomas S.",
    role: "Science Teacher, Munich",
    avatar: "TS",
  },
  {
    quote: "Finally, an EdTech platform that takes GDPR seriously. Data stays in our control.",
    author: "Dr. Anna W.",
    role: "School Administrator, Vienna",
    avatar: "AW",
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 overflow-hidden text-foreground pb-4">
      {/* Navigation (Pure White Background) */}
      <header
        className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur-md"
      >
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Logo size="md" />
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-bold text-foreground/70 hover:text-foreground transition-colors">Features</a>
            <a href="#how-it-works" className="text-sm font-bold text-foreground/70 hover:text-foreground transition-colors">How it Works</a>
            <a href="#testimonials" className="text-sm font-bold text-foreground/70 hover:text-foreground transition-colors">Reviews</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/auth/login">
              <Button variant="ghost" size="sm" className="font-bold">Log in</Button>
            </Link>
            <Link href="/auth/register">
              <Button
                size="sm"
                className="text-white border-0 shadow-lg hover:shadow-blue-500/30 hover:opacity-90 transition-all rounded-full font-bold px-6 shadow-blue-500/20"
                style={{ backgroundColor: '#0066FF' }}
              >
                Start Free
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section (Pure White + Blue Accents) */}
      <section className="relative py-24 lg:py-32 bg-white m-2 lg:m-4 rounded-[3rem] shadow-sm border border-black/5">
        {/* Subtle Blue Glow Orbs */}
        <div className="absolute inset-0 -z-10 overflow-hidden rounded-[3rem]">
          <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-[#0066FF]/10 blur-3xl" />
          <div className="absolute top-1/2 -left-40 w-80 h-80 rounded-full bg-cyan-500/10 blur-3xl" />
        </div>

        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl text-center">
            <Badge variant="secondary" className="mb-6 px-4 py-2 text-sm font-bold rounded-full border-blue-500/20 bg-blue-500/10 text-[#0066FF]">
              <Sparkles className="w-4 h-4 mr-2 inline" />
              Trusted by 500+ European Schools
            </Badge>
            <h1 className="text-5xl font-black tracking-tight sm:text-6xl lg:text-7xl text-balance leading-tight text-[#0A1A3F] drop-shadow-sm">
              Learn Smarter with
              <br />
              <span className="text-[#0066FF] drop-shadow-md">AI-Powered Education</span>
            </h1>
            <p className="mt-8 text-xl leading-relaxed text-slate-600 font-medium text-pretty max-w-2xl mx-auto">
              COPA helps teachers create inclusive, differentiated lessons while giving every student a personalized learning experience. Built for European schools.
            </p>
            <div className="mt-12 flex flex-col items-center justify-center">
              {/* Official COPA Brand Logo Integration */}
              <div className="mb-14 flex flex-col items-center max-w-[400px] w-full mx-auto relative group">
                <img
                  src="/copa_logo.png"
                  alt="COPA - Conversation Partner"
                  className="w-full h-auto object-contain transition-transform duration-700 group-hover:scale-105"
                />
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/auth/register">
                  <Button
                    size="lg"
                    className="text-white border-0 shadow-xl hover:shadow-2xl shadow-blue-500/30 hover:shadow-blue-500/40 transition-all hover:-translate-y-1 rounded-full h-14 px-8 text-lg font-bold"
                    style={{ backgroundColor: '#0066FF' }}
                  >
                    Get Started Free
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="lg" className="rounded-full h-14 px-8 text-lg border-2 font-bold bg-white text-foreground hover:bg-blue-50/50 border-[#0066FF] hover:border-[#0066FF] transition-all group">
                      <Play className="mr-2 h-5 w-5 text-[#0066FF] group-hover:scale-110 transition-transform" />
                      Watch Demo
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-none w-screen h-screen m-0 rounded-none bg-[#0A0C10] border-0 overflow-hidden p-0 [&>button]:text-white [&>button]:hover:text-white/80 [&>button]:top-8 [&>button]:right-8 [&>button]:z-50 [&>button_svg]:w-10 [&>button_svg]:h-10 gap-0">
                    <DialogTitle className="sr-only">Watch Demo</DialogTitle>
                    <div className="flex flex-col md:flex-row h-screen w-screen text-white">
                      {/* Left Sidebar: Scanned Document */}
                      <div className="md:w-1/2 bg-white/5 border-r border-white/10 p-8 flex flex-col relative overflow-hidden">
                        <div className="flex items-center gap-2 mb-6">
                          <div className="w-3 h-3 rounded-full bg-red-400" />
                          <div className="w-3 h-3 rounded-full bg-amber-400" />
                          <div className="w-3 h-3 rounded-full bg-green-400" />
                        </div>
                        <h3 className="text-xl font-bold text-white/80 mb-6 font-mono">TUM_Management_Script_FA23.pdf</h3>

                        {/* Fake blurred document content */}
                        <div className="flex-1 rounded-xl bg-white/10 backdrop-blur-md p-6 relative overflow-hidden border border-white/5">
                          <div className="space-y-6 opacity-30">
                            <div className="h-6 bg-white/40 rounded w-3/4"></div>
                            <div className="h-4 bg-white/40 rounded w-full"></div>
                            <div className="h-4 bg-white/40 rounded w-5/6"></div>
                            <div className="h-4 bg-white/40 rounded w-full"></div>
                            <div className="h-6 bg-white/40 rounded w-4/5 pt-4 mt-8"></div>
                            <div className="h-4 bg-white/40 rounded w-full"></div>
                            <div className="h-4 bg-white/40 rounded w-5/6"></div>
                            <div className="h-4 bg-white/40 rounded w-11/12"></div>

                            {/* Scanning laser effect */}
                            <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-[#0066FF] shadow-[0_0_15px_rgba(0,102,255,1)] animate-pulse" />
                          </div>
                        </div>
                      </div>

                      {/* Right Panel: AI generating */}
                      <div className="md:w-1/2 p-12 lg:p-24 flex flex-col justify-center relative bg-[#0A0C10]">
                        <div className="w-20 h-20 rounded-2xl bg-[#0066FF]/10 flex items-center justify-center mb-8 shadow-inner ring-1 ring-[#0066FF]/30 backdrop-blur-xl shrink-0">
                          <Brain className="w-10 h-10 text-[#0066FF] animate-bounce" />
                        </div>
                        <h2 className="text-5xl lg:text-6xl font-black mb-6 leading-tight">Mission Control</h2>
                        <p className="text-white/60 mb-10 font-medium text-xl leading-relaxed max-w-xl">Analyzing 84 pages of complex management theory and instantly extracting actionable flashcards...</p>

                        {/* Electric Blue Progress Bar */}
                        <div className="w-full max-w-xl h-4 bg-white/10 rounded-full overflow-hidden mb-4 relative drop-shadow-xl border border-white/5">
                          <div className="absolute top-0 left-0 h-full bg-[#0066FF] rounded-full w-2/3 shadow-[0_0_20px_rgba(0,102,255,0.8)] animate-pulse" />
                        </div>
                        <p className="text-sm text-[#0066FF] font-bold tracking-wider uppercase mb-12">Generating: 67% Complete</p>

                        {/* Staggered Animated Flashcards Feed */}
                        <div className="space-y-4 max-w-xl">
                          {[
                            { q: "What is Porter's Five Forces?", a: "A framework for analyzing the level of competition within an industry.", delay: "0ms" },
                            { q: "Define Transformational Leadership", a: "A leadership approach that causes change in individuals and social systems.", delay: "400ms" },
                            { q: "What is the Agency Problem?", a: "A conflict of interest inherent in any relationship where one party is expected to act in another's best interests.", delay: "800ms" },
                          ].map((card, i) => (
                            <div
                              key={i}
                              className="animate-in fade-in slide-in-from-bottom-8 duration-1000 fill-mode-both bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors"
                              style={{ animationDelay: card.delay }}
                            >
                              <div className="flex gap-4">
                                <div className="mt-1 w-8 h-8 rounded-full bg-[#0066FF]/20 flex items-center justify-center shrink-0 border border-[#0066FF]/50">
                                  <Sparkles className="w-4 h-4 text-[#0066FF]" />
                                </div>
                                <div>
                                  <h4 className="font-bold text-white mb-2">{card.q}</h4>
                                  <p className="text-white/70 text-sm">{card.a}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {/* Stats */}
            <div className="mt-16 mb-20 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center group">
                  <div className="text-4xl lg:text-5xl font-black text-[#0066FF] group-hover:scale-105 transition-transform">
                    {stat.value}
                  </div>
                  <div className="text-sm text-foreground/60 font-bold mt-2 uppercase tracking-wider">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Product Preview Frame */}
            <div className="relative mx-auto mt-16 max-w-5xl">
              <div className="rounded-[3rem] p-4 md:p-6 bg-white/50 backdrop-blur-sm border border-black/5 shadow-2xl relative z-10">
                <div
                  className="aspect-video w-full rounded-[2.5rem] bg-gradient-to-br from-[#0A0C10] via-slate-900 to-[#0066FF] flex items-center justify-center relative overflow-hidden group shadow-inner"
                >
                  {/* Glassmorphism Play Button */}
                  <div className="w-24 h-24 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center group-hover:scale-110 group-hover:bg-[#0066FF]/20 transition-all cursor-pointer shadow-2xl">
                    <Play className="w-10 h-10 text-white fill-white/20 ml-2" />
                  </div>

                  {/* Subtle Video UI Accents */}
                  <div className="absolute bottom-6 left-8 right-8 h-2 rounded-full bg-white/10 overflow-hidden backdrop-blur-sm">
                    <div className="h-full w-1/3 rounded-full bg-[#0066FF] shadow-[0_0_10px_rgba(0,102,255,0.8)]" />
                  </div>
                  <div className="absolute top-6 left-8 right-8 flex justify-between items-center px-4">
                    <div className="flex gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-400" />
                      <div className="w-3 h-3 rounded-full bg-amber-400" />
                      <div className="w-3 h-3 rounded-full bg-green-400" />
                    </div>
                  </div>
                </div>
              </div>
              {/* Soft underlying shadow to pop the frame */}
              <div className="absolute inset-0 bg-blue-500/20 blur-3xl -z-10 rounded-[4rem] transform translate-y-10" />
            </div>
          </div>
        </div>
      </section>

      {/* Content Section (Ice-Blue #F8FAFF) */}
      <section id="how-it-works" className="py-24 bg-[#F8FAFF] m-2 lg:m-4 rounded-[3rem] shadow-sm border border-blue-100/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 rounded-full font-bold border-blue-500/20 text-blue-800 bg-blue-500/5">How it Works</Badge>
            <h2 className="text-4xl font-black tracking-tight text-[#0A1A3F] sm:text-5xl drop-shadow-sm">
              Get started in 3 easy steps
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
            {[
              { step: 1, icon: Globe, title: 'Connect', desc: 'Link to your LMS in minutes with full GDPR compliance.' },
              { step: 2, icon: Sparkles, title: 'Create', desc: 'Build highly personalized lessons with smart AI assistance.' },
              { step: 3, icon: Users, title: 'Teach', desc: 'Watch students thrive with adaptive and fun study tools.' },
            ].map((item) => (
              <div key={item.step}>
                <Card className="border-0 shadow-[0_20px_50px_rgba(0,102,255,0.08)] bg-white hover:shadow-[0_20px_50px_rgba(0,102,255,0.15)] transition-all overflow-hidden group h-full rounded-[3rem] hover:scale-[1.02] duration-300">
                  <CardContent className="p-10">
                    <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-[1.5rem] bg-[#F8FAFF] group-hover:bg-[#0066FF] border border-[#0066FF]/5 transition-all shadow-sm relative">
                      <item.icon className="h-8 w-8 text-[#0066FF] group-hover:text-white" />
                      <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full text-white font-bold flex items-center justify-center text-xs shadow-md" style={{ backgroundColor: '#0066FF' }}>
                        {item.step}
                      </div>
                    </div>
                    <h3 className="text-2xl font-black text-[#0A1A3F] mb-3">{item.title}</h3>
                    <p className="text-base text-slate-600 leading-relaxed font-medium">{item.desc}</p>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature / Impact Section (Midnight Navy #0A0C10) */}
      <section id="features" className="py-32 bg-[#0A0C10] m-2 lg:m-4 rounded-[3rem] relative text-white shadow-[0_20px_40px_-15px_rgba(0,102,255,0.2)]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 rounded-full border-blue-500/30 text-blue-200 bg-blue-500/10 font-bold uppercase tracking-widest">
              Impact & Features
            </Badge>
            <h2 className="text-4xl font-black tracking-tight text-white sm:text-5xl">
              Everything you need to teach better
            </h2>
            <p className="mt-4 text-lg text-blue-200/60 max-w-2xl mx-auto font-medium">
              Powerful AI tools designed specifically for European educators and students
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 max-w-6xl mx-auto">
            {features.map((feature, i) => (
              <div key={i}>
                {/* Dark Glassmorphism Cards */}
                <Card className="border border-white/5 bg-white/5 backdrop-blur-xl transition-all hover:bg-white/10 hover:border-blue-500/30 hover:shadow-[0_0_30px_-10px_rgba(0,102,255,0.3)] overflow-hidden group h-full rounded-[2.5rem]">
                  <CardContent className="p-8">
                    <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-[#0A0C10] border border-white/10 group-hover:scale-110 group-hover:bg-[#0066FF] group-hover:border-[#0066FF] transition-all shadow-inner">
                      <feature.icon className="h-7 w-7 text-blue-100 group-hover:text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                    <p className="text-sm text-blue-100/60 leading-relaxed font-medium">{feature.description}</p>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>

          <div className="mt-16 flex justify-center">
            <Button size="lg" className="rounded-full font-bold px-10 h-14 bg-[#0066FF] hover:bg-blue-600 text-white shadow-[0_0_30px_-5px_rgba(0,102,255,0.4)] border border-blue-400/30 hover:shadow-[0_0_40px_-5px_rgba(0,102,255,0.6)] transition-all scale-100 hover:scale-105">
              Explore All Features
            </Button>
          </div>
        </div>
      </section>

      {/* Advanced Learning Modes (Ice-Blue #F8FAFF) */}
      <section className="py-24 bg-[#F8FAFF] m-2 lg:m-4 rounded-[3rem] shadow-sm border border-blue-100/50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <Badge variant="outline" className="mb-4 rounded-full border-blue-500/20 text-blue-800 bg-blue-500/5 font-bold">Personalized Learning</Badge>
                <h2 className="text-4xl font-black tracking-tight text-[#0A1A3F] mb-6 drop-shadow-sm">
                  Students choose how they learn
                </h2>
                <p className="text-lg text-slate-600 mb-8 font-medium">
                  Not everyone learns the same way. COPA adapts to each student, offering content in their preferred format.
                </p>
                <div className="space-y-4">
                  {learningModes.map((mode) => (
                    <div key={mode.label} className="flex items-center gap-6 p-6 rounded-[3rem] bg-white shadow-[0_10px_30px_rgba(0,102,255,0.05)] border border-[#0066FF]/5 hover:shadow-[0_20px_50px_rgba(0,102,255,0.12)] transition-transform duration-300 hover:scale-[1.02] group">
                      <div className="flex h-14 w-14 items-center justify-center rounded-[1.25rem] bg-[#F8FAFF] text-[#0066FF] group-hover:bg-[#0066FF] group-hover:text-white transition-all shadow-sm">
                        <mode.icon className="h-7 w-7" />
                      </div>
                      <div>
                        <h3 className="font-black text-xl text-[#0A1A3F]">{mode.label}</h3>
                        <p className="text-sm text-slate-500 font-medium mt-1">{mode.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative hidden lg:block">
                <div
                  className="aspect-square rounded-[3rem] p-8 shadow-2xl relative z-10"
                  style={{ background: 'linear-gradient(135deg, rgba(0, 102, 255, 0.4) 0%, rgba(6, 182, 212, 0.4) 100%)' }}
                >
                  <div className="h-full w-full rounded-[2.5rem] flex items-center justify-center bg-white/95 backdrop-blur-xl border border-white shadow-inner">
                    <div className="text-center">
                      <div
                        className="w-28 h-28 mx-auto mb-6 rounded-full flex items-center justify-center shadow-xl shadow-blue-500/20"
                        style={{ backgroundColor: '#0066FF' }}
                      >
                        <Sparkles className="w-14 h-14 text-white" />
                      </div>
                      <p className="text-3xl font-black text-foreground">AI-Powered</p>
                      <p className="text-[#0066FF] font-bold mt-2">Adaptive Workflows</p>
                    </div>
                  </div>
                </div>
                {/* Floating Elements */}
                <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full shadow-2xl shadow-blue-500/20 flex items-center justify-center bg-[#0066FF] z-20 animate-bounce">
                  <TrendingUp className="w-10 h-10 text-white" />
                </div>
                <div className="absolute -bottom-8 -left-8 w-20 h-20 rounded-full shadow-2xl shadow-cyan-500/20 flex items-center justify-center bg-cyan-500 z-20">
                  <CheckCircle2 className="w-8 h-8 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials (Pure White) */}
      <section id="testimonials" className="py-24 bg-white m-2 lg:m-4 rounded-[3rem] shadow-sm border border-black/5">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 rounded-full font-bold border-blue-500/20 text-blue-800 bg-blue-500/5">Reviews</Badge>
            <h2 className="text-4xl font-black tracking-tight text-[#0A1A3F] sm:text-5xl drop-shadow-sm">
              Trusted by Students
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {testimonials.map((testimonial, i) => (
              <div key={i}>
                <Card className="border-0 shadow-[0_20px_50px_rgba(0,102,255,0.08)] bg-white hover:shadow-[0_20px_50px_rgba(0,102,255,0.15)] rounded-[3rem] hover:scale-[1.02] transition-transform duration-300">
                  <CardContent className="p-10">
                    <div className="flex gap-1 mb-6">
                      {[...Array(5)].map((_, j) => (
                        <Star key={j} className="w-5 h-5 fill-[#0066FF] text-[#0066FF]" />
                      ))}
                    </div>
                    <p className="text-[#0A1A3F] font-bold mb-8 text-lg leading-relaxed text-balance">
                      &ldquo;{testimonial.quote}&rdquo;
                    </p>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-[1.25rem] flex items-center justify-center text-white font-bold bg-[#0A1A3F] shadow-sm border border-white/10">
                        {testimonial.avatar}
                      </div>
                      <div>
                        <p className="font-black text-[#0A1A3F] text-lg">{testimonial.author}</p>
                        <p className="text-sm font-medium text-slate-500">{testimonial.role}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section (Rich Gradient Blue -> Cyan) */}
      <section className="py-32 relative overflow-hidden m-2 lg:m-4 rounded-[3rem] shadow-xl">
        {/* Deep Vibrant Gradient */}
        <div
          className="absolute inset-0 z-0 bg-gradient-to-br from-[#0066FF] via-blue-500 to-cyan-400"
        />
        <div className="container mx-auto px-4 relative z-10">
          <div className="mx-auto max-w-3xl text-center">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-8 backdrop-blur-sm border border-white/30 text-white shadow-inner">
              <Zap className="h-10 w-10" />
            </div>
            <h2 className="text-4xl font-black tracking-tight text-white sm:text-6xl mb-6 text-balance">
              Ready to transform your classroom?
            </h2>
            <p className="text-xl text-white/90 mb-12 font-medium">
              Join hundreds of European schools already using COPA
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/auth/register">
                <Button size="lg" className="bg-white text-[#0066FF] hover:bg-white/95 rounded-full h-16 px-10 text-xl font-black shadow-2xl hover:scale-105 transition-transform hover:shadow-[0_0_40px_-10px_rgba(255,255,255,0.8)]">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-6 w-6" />
                </Button>
              </Link>
              <Button
                variant="outline"
                size="lg"
                className="rounded-full h-16 px-10 text-xl font-bold border-2 bg-white/10 text-white border-white/30 hover:bg-white/20 backdrop-blur-md"
              >
                Schedule Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Clean Footer */}
      <footer className="border-t border-black/5 py-16 bg-white mx-2 lg:mx-4 rounded-[3rem] px-8 mb-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div>
              <Logo size="md" />
              <p className="mt-4 text-sm font-medium text-foreground/60 text-balance">
                AI-powered education platform built for COPA students.
              </p>
            </div>
            <div>
              <h4 className="font-black text-foreground mb-4 uppercase tracking-wider text-sm">Product</h4>
              <ul className="space-y-3 text-sm font-medium text-foreground/60">
                <li><a href="#" className="hover:text-[#0066FF] transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-[#0066FF] transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-[#0066FF] transition-colors">Integrations</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-black text-foreground mb-4 uppercase tracking-wider text-sm">Resources</h4>
              <ul className="space-y-3 text-sm font-medium text-foreground/60">
                <li><a href="#" className="hover:text-[#0066FF] transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-[#0066FF] transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-[#0066FF] transition-colors">Blog</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-black text-foreground mb-4 uppercase tracking-wider text-sm">Legal</h4>
              <ul className="space-y-3 text-sm font-medium text-foreground/60">
                <li><a href="#" className="hover:text-[#0066FF] transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-[#0066FF] transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-[#0066FF] transition-colors">GDPR</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex flex-col items-center md:items-start gap-1">
              <p className="text-sm font-bold text-foreground/40">
                2026 COPA. Made with care for European schools.
              </p>
              <p className="text-[10px] uppercase tracking-widest font-bold text-foreground/20">
                COPA was produced by EduBridge
              </p>
            </div>
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-[#F0F8FF] border border-blue-100 flex items-center justify-center hover:bg-[#0066FF] hover:text-white transition-colors cursor-pointer text-[#0066FF] shadow-sm">
                <Globe className="w-5 h-5" />
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
