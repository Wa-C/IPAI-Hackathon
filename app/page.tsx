'use client'

import Link from 'next/link'
import { Logo } from '@/components/logo'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  BookOpen,
  Users,
  Shield,
  Sparkles,
  Play,
  ArrowRight,
  CheckCircle2,
  Globe,
  Lock,
  Zap,
  Brain,
  Target,
  Award,
  TrendingUp,
  MessageCircle,
  Star,
} from 'lucide-react'

const stats = [
  { value: '500+', label: 'Schools' },
  { value: '50k+', label: 'Students' },
  { value: '98%', label: 'Satisfaction' },
  { value: '40%', label: 'Time Saved' },
]

const features = [
  {
    icon: Brain,
    title: 'AI Lesson Builder',
    description: 'Generate differentiated content in seconds with smart AI that understands curriculum standards.',
    color: 'from-purple-500 to-indigo-500',
  },
  {
    icon: Target,
    title: 'Adaptive Learning',
    description: 'Every student gets personalized pathways based on their learning style and pace.',
    color: 'from-cyan-500 to-blue-500',
  },
  {
    icon: Shield,
    title: 'Bias Scanner',
    description: 'Automatically detect and fix cultural, gender, and accessibility bias in your materials.',
    color: 'from-emerald-500 to-teal-500',
  },
  {
    icon: Award,
    title: 'Gamification',
    description: 'Keep students engaged with achievements, streaks, and collaborative challenges.',
    color: 'from-orange-500 to-red-500',
  },
]

const learningModes = [
  { icon: BookOpen, label: 'Read', description: 'Traditional text-based learning' },
  { icon: Play, label: 'Play', description: 'Interactive games and quizzes' },
  { icon: MessageCircle, label: 'Watch', description: 'Video explanations' },
]

const testimonials = [
  {
    quote: "EdCopilot has transformed how I prepare lessons. What used to take hours now takes minutes.",
    author: "Maria K.",
    role: "Mathematics Teacher, Berlin",
    avatar: "MK",
  },
  {
    quote: "My students love choosing how they learn. Engagement is up 40% since we started using EdCopilot.",
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
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Navigation */}
      <header 
        className="sticky top-0 z-50 w-full border-b"
        style={{ 
          backdropFilter: 'blur(16px)', 
          WebkitBackdropFilter: 'blur(16px)',
          backgroundColor: 'rgba(255, 255, 255, 0.85)'
        }}
      >
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Logo size="md" />
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Features</a>
            <a href="#how-it-works" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">How it Works</a>
            <a href="#testimonials" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Reviews</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/auth/login">
              <Button variant="ghost" size="sm">Log in</Button>
            </Link>
            <Link href="/auth/register">
              <Button 
                size="sm" 
                className="text-white border-0 shadow-lg hover:shadow-xl hover:opacity-90 transition-all"
                style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #6366f1 50%, #3b82f6 100%)' }}
              >
                Start Free
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-24 lg:py-32">
        {/* Gradient Orbs */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-gradient-to-br from-primary/30 to-transparent blur-3xl" />
          <div className="absolute top-1/2 -left-40 w-80 h-80 rounded-full bg-gradient-to-tr from-accent/20 to-transparent blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-72 h-72 rounded-full bg-gradient-to-tl from-chart-2/20 to-transparent blur-3xl" />
        </div>

        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl text-center">
            <Badge variant="secondary" className="mb-6 px-4 py-2 text-sm font-medium rounded-full border-primary/20 bg-primary/10 text-primary">
              <Sparkles className="w-4 h-4 mr-2 inline" />
              Trusted by 500+ European Schools
            </Badge>
            <h1 className="text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl text-balance leading-tight">
              <span className="text-foreground">Learn Smarter with</span>
              <br />
              <span style={{ 
                background: 'linear-gradient(135deg, #7c3aed 0%, #3b82f6 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>AI-Powered Education</span>
            </h1>
            <p className="mt-8 text-xl leading-relaxed text-muted-foreground text-pretty max-w-2xl mx-auto">
              EdCopilot helps teachers create inclusive, differentiated lessons while giving every student a personalized learning experience. Built for European schools.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/auth/register">
                <Button 
                  size="lg" 
                  className="text-white border-0 shadow-lg hover:shadow-xl transition-all hover:scale-105 hover:opacity-90 rounded-xl h-14 px-8 text-lg"
                  style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #6366f1 50%, #3b82f6 100%)' }}
                >
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="rounded-xl h-14 px-8 text-lg border-2 hover:bg-secondary/50">
                <Play className="mr-2 h-5 w-5" />
                Watch Demo
              </Button>
            </div>

            {/* Stats */}
            <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div 
                    className="text-3xl lg:text-4xl font-bold"
                    style={{ 
                      background: 'linear-gradient(135deg, #7c3aed 0%, #3b82f6 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text'
                    }}
                  >{stat.value}</div>
                  <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 rounded-full">Features</Badge>
            <h2 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              Everything you need to teach better
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Powerful AI tools designed specifically for European educators and students
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 max-w-6xl mx-auto">
            {features.map((feature, i) => (
              <Card key={i} className="card-interactive border-0 shadow-lg bg-card overflow-hidden group">
                <CardContent className="p-6">
                  <div className={`mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${feature.color} shadow-lg group-hover:scale-110 transition-transform`}>
                    <feature.icon className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Learning Modes */}
      <section className="py-24 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <Badge variant="outline" className="mb-4 rounded-full">Personalized Learning</Badge>
                <h2 className="text-4xl font-bold tracking-tight text-foreground mb-6">
                  Students choose how they learn
                </h2>
                <p className="text-lg text-muted-foreground mb-8">
                  Not everyone learns the same way. EdCopilot adapts to each student, offering content in their preferred format.
                </p>
                <div className="space-y-4">
                  {learningModes.map((mode) => (
                    <div key={mode.label} className="flex items-center gap-4 p-4 rounded-2xl bg-card shadow-sm border border-border hover:shadow-md transition-shadow">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                        <mode.icon className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{mode.label}</h3>
                        <p className="text-sm text-muted-foreground">{mode.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="relative">
                <div 
                  className="aspect-square rounded-3xl p-8"
                  style={{ 
                    background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.15) 0%, rgba(99, 102, 241, 0.15) 50%, rgba(249, 115, 22, 0.15) 100%)',
                    boxShadow: '0 20px 40px -12px rgba(0, 0, 0, 0.15), 0 8px 20px -8px rgba(0, 0, 0, 0.1)'
                  }}
                >
                  <div 
                    className="h-full w-full rounded-2xl flex items-center justify-center"
                    style={{ 
                      backdropFilter: 'blur(24px)',
                      WebkitBackdropFilter: 'blur(24px)',
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      border: '1px solid rgba(0, 0, 0, 0.08)'
                    }}
                  >
                    <div className="text-center">
                      <div 
                        className="w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center shadow-xl"
                        style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #6366f1 50%, #3b82f6 100%)' }}
                      >
                        <Sparkles className="w-12 h-12 text-white" />
                      </div>
                      <p className="text-2xl font-bold text-foreground">AI-Powered</p>
                      <p className="text-muted-foreground">Adaptive Learning</p>
                    </div>
                  </div>
                </div>
                {/* Floating elements */}
                <div 
                  className="absolute -top-4 -right-4 w-20 h-20 rounded-2xl shadow-xl flex items-center justify-center animate-bounce"
                  style={{ backgroundColor: '#f97316' }}
                >
                  <TrendingUp className="w-10 h-10 text-white" />
                </div>
                <div 
                  className="absolute -bottom-4 -left-4 w-16 h-16 rounded-2xl shadow-xl flex items-center justify-center"
                  style={{ backgroundColor: '#22c55e' }}
                >
                  <CheckCircle2 className="w-8 h-8 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 rounded-full">How it Works</Badge>
            <h2 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              Get started in 3 easy steps
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { step: 1, icon: Globe, title: 'Connect', desc: 'Link to your LMS in minutes' },
              { step: 2, icon: Sparkles, title: 'Create', desc: 'Build lessons with AI assistance' },
              { step: 3, icon: Users, title: 'Teach', desc: 'Watch students thrive' },
            ].map((item) => (
              <div key={item.step} className="text-center group">
                <div className="relative mx-auto mb-6">
                  <div 
                    className="w-20 h-20 rounded-2xl flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform"
                    style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #6366f1 50%, #3b82f6 100%)' }}
                  >
                    <item.icon className="w-10 h-10 text-white" />
                  </div>
                  <div 
                    className="absolute -top-2 -right-2 w-8 h-8 rounded-full text-white font-bold flex items-center justify-center text-sm shadow-lg"
                    style={{ backgroundColor: '#f97316' }}
                  >
                    {item.step}
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">{item.title}</h3>
                <p className="text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 rounded-full">Reviews</Badge>
            <h2 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              Loved by educators
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {testimonials.map((testimonial, i) => (
              <Card key={i} className="border-0 shadow-lg bg-card card-interactive">
                <CardContent className="p-6">
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, j) => (
                      <Star key={j} className="w-5 h-5" style={{ fill: '#f97316', color: '#f97316' }} />
                    ))}
                  </div>
                  <p className="text-foreground mb-6 leading-relaxed">{`"${testimonial.quote}"`}</p>
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm"
                      style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #6366f1 50%, #3b82f6 100%)' }}
                    >
                      {testimonial.avatar}
                    </div>
                    <div>
                      <p className="font-medium text-foreground text-sm">{testimonial.author}</p>
                      <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Privacy Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <Card className="max-w-4xl mx-auto border-0 shadow-xl overflow-hidden">
            <CardContent className="p-0">
              <div className="grid md:grid-cols-2">
                <div className="p-8 lg:p-12">
                  <div 
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium mb-6"
                    style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)', color: '#22c55e' }}
                  >
                    <Shield className="w-4 h-4" />
                    GDPR Compliant
                  </div>
                  <h3 className="text-2xl lg:text-3xl font-bold text-foreground mb-4">
                    Your data stays with you
                  </h3>
                  <p className="text-muted-foreground leading-relaxed mb-6">
                    Student data never leaves your organization. Our federated architecture ensures complete privacy while still delivering powerful AI features.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary" className="rounded-full">EU Data Centers</Badge>
                    <Badge variant="secondary" className="rounded-full">Federated Learning</Badge>
                    <Badge variant="secondary" className="rounded-full">End-to-End Encryption</Badge>
                  </div>
                </div>
                <div 
                  className="p-8 lg:p-12 flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #6366f1 50%, #3b82f6 100%)' }}
                >
                  <div className="text-center">
                    <Lock className="w-20 h-20 text-white/90 mx-auto mb-4" />
                    <p className="text-white/90 text-lg font-medium">Privacy by Design</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div 
          className="absolute inset-0 opacity-95" 
          style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #6366f1 50%, #3b82f6 100%)' }}
        />
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-48 h-48 rounded-full bg-white/10 blur-3xl" />
        </div>
        <div className="container mx-auto px-4 relative">
          <div className="mx-auto max-w-3xl text-center">
            <Zap className="mx-auto h-16 w-16 text-white/90 mb-8" />
            <h2 className="text-4xl font-bold tracking-tight text-white sm:text-5xl mb-6">
              Ready to transform your classroom?
            </h2>
            <p className="text-xl text-white/80 mb-10">
              Join hundreds of European schools already using EdCopilot
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/auth/register">
                <Button size="lg" className="bg-white text-primary hover:bg-white/90 rounded-xl h-14 px-8 text-lg shadow-xl">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Button 
                variant="outline" 
                size="lg" 
                className="rounded-xl h-14 px-8 text-lg border-2"
                style={{ borderColor: 'rgba(255,255,255,0.4)', color: 'white', backgroundColor: 'transparent' }}
              >
                Schedule Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-16 bg-card">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div>
              <Logo size="md" />
              <p className="mt-4 text-sm text-muted-foreground">
                AI-powered education platform built for European schools. Privacy-first, student-centered.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Product</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Integrations</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Resources</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Blog</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Legal</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">GDPR</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              2024 EdCopilot. Made with care for European schools.
            </p>
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-primary/10 transition-colors cursor-pointer">
                <Globe className="w-4 h-4 text-muted-foreground" />
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
