'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { Logo } from '@/components/logo'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Spinner } from '@/components/ui/spinner'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { GraduationCap, BookOpen, Sparkles, ArrowRight, Shield, ShieldCheck, Network, Cpu, Braces } from 'lucide-react'
import type { UserRole } from '@/lib/types'

const particles = Array.from({ length: 40 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 3 + 1,
  duration: Math.random() * 20 + 10,
  delay: Math.random() * 10,
}))

const nodeConnections = [
  { x1: 15, y1: 20, x2: 35, y2: 35 },
  { x1: 35, y1: 35, x2: 60, y2: 25 },
  { x1: 60, y1: 25, x2: 85, y2: 40 },
  { x1: 20, y1: 55, x2: 45, y2: 65 },
  { x1: 45, y1: 65, x2: 70, y2: 55 },
  { x1: 70, y1: 55, x2: 85, y2: 70 },
  { x1: 35, y1: 35, x2: 45, y2: 65 },
  { x1: 60, y1: 25, x2: 70, y2: 55 },
  { x1: 25, y1: 80, x2: 50, y2: 85 },
  { x1: 50, y1: 85, x2: 75, y2: 80 },
]

export default function LoginPage() {
  const router = useRouter()
  const { login, organisations, isLoading } = useAuth()

  const [role, setRole] = useState<UserRole>('teacher')
  const [organisationId, setOrganisationId] = useState(organisations[0]?.id || '')
  const [orgCode, setOrgCode] = useState('')
  const [showOrgCode, setShowOrgCode] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await login(role, organisationId)
    if (role === 'admin') {
      router.push('/admin/dashboard')
    } else {
      router.push(role === 'teacher' ? '/teacher/dashboard' : '/student/dashboard')
    }
  }

  const roles = [
    {
      value: 'student' as UserRole,
      label: 'Student',
      icon: GraduationCap,
      description: 'Access your learning',
      gradient: 'from-cyan-500 via-blue-500 to-indigo-500',
    },
    {
      value: 'teacher' as UserRole,
      label: 'Teacher',
      icon: BookOpen,
      description: 'Manage your classes',
      gradient: 'from-violet-500 via-purple-500 to-fuchsia-500',
    },
    {
      value: 'admin' as UserRole,
      label: 'Admin',
      icon: ShieldCheck,
      description: 'Platform overview',
      gradient: 'from-emerald-500 via-teal-500 to-cyan-500',
    },
  ]

  return (
    <div className="min-h-screen flex relative overflow-hidden">
      {/* Animated Background - Left Panel */}
      <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden">
        {/* Deep dark gradient base */}
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(160deg, #0a0a1a 0%, #0d1033 30%, #1a0a2e 60%, #0a1628 100%)' }}
        />

        {/* Animated mesh gradient overlay */}
        <div className="absolute inset-0 opacity-60">
          <div
            className="absolute w-[600px] h-[600px] rounded-full blur-[120px]"
            style={{
              background: 'radial-gradient(circle, rgba(124, 58, 237, 0.4) 0%, transparent 70%)',
              top: '-10%', left: '-10%',
              animation: 'float1 15s ease-in-out infinite',
            }}
          />
          <div
            className="absolute w-[500px] h-[500px] rounded-full blur-[100px]"
            style={{
              background: 'radial-gradient(circle, rgba(59, 130, 246, 0.35) 0%, transparent 70%)',
              bottom: '-10%', right: '-5%',
              animation: 'float2 18s ease-in-out infinite',
            }}
          />
          <div
            className="absolute w-[400px] h-[400px] rounded-full blur-[80px]"
            style={{
              background: 'radial-gradient(circle, rgba(6, 182, 212, 0.25) 0%, transparent 70%)',
              top: '40%', left: '30%',
              animation: 'float3 12s ease-in-out infinite',
            }}
          />
        </div>

        {/* Neural network / Federated learning visualization */}
        <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 100 100" preserveAspectRatio="none">
          {nodeConnections.map((conn, i) => (
            <line
              key={i}
              x1={`${conn.x1}%`} y1={`${conn.y1}%`}
              x2={`${conn.x2}%`} y2={`${conn.y2}%`}
              stroke="rgba(139, 92, 246, 0.3)"
              strokeWidth="0.15"
              style={{
                animation: `pulseOpacity ${3 + i * 0.5}s ease-in-out infinite`,
                animationDelay: `${i * 0.3}s`,
              }}
            />
          ))}
          {[
            { cx: 15, cy: 20 }, { cx: 35, cy: 35 }, { cx: 60, cy: 25 },
            { cx: 85, cy: 40 }, { cx: 20, cy: 55 }, { cx: 45, cy: 65 },
            { cx: 70, cy: 55 }, { cx: 85, cy: 70 }, { cx: 25, cy: 80 },
            { cx: 50, cy: 85 }, { cx: 75, cy: 80 },
          ].map((node, i) => (
            <circle
              key={i}
              cx={`${node.cx}%`} cy={`${node.cy}%`}
              r="0.6"
              fill="rgba(167, 139, 250, 0.6)"
              style={{
                animation: `pulseScale ${2 + i * 0.3}s ease-in-out infinite`,
                animationDelay: `${i * 0.2}s`,
                transformOrigin: `${node.cx}% ${node.cy}%`,
              }}
            />
          ))}
        </svg>

        {/* Floating particles */}
        {mounted && (
          <div className="absolute inset-0">
            {particles.map((p) => (
              <div
                key={p.id}
                className="absolute rounded-full"
                style={{
                  width: `${p.size}px`,
                  height: `${p.size}px`,
                  left: `${p.x}%`,
                  top: `${p.y}%`,
                  background: `rgba(${150 + Math.random() * 100}, ${100 + Math.random() * 100}, 255, ${0.2 + Math.random() * 0.3})`,
                  animation: `floatParticle ${p.duration}s ease-in-out infinite`,
                  animationDelay: `${p.delay}s`,
                }}
              />
            ))}
          </div>
        )}

        {/* Grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-12 text-white w-full">
          <div className="flex items-center gap-3">
            <Logo size="lg" className="[&_span]:text-white [&_div]:bg-white/10 [&_div]:backdrop-blur-sm" />
          </div>

          <div className="max-w-lg">
            <div className="flex items-center gap-2 mb-6">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-violet-400/50 to-transparent" />
              <span className="text-xs font-medium tracking-[0.2em] uppercase text-violet-300/80">Federated AI Platform</span>
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-violet-400/50 to-transparent" />
            </div>

            <h1 className="text-5xl font-bold mb-6 leading-[1.1] tracking-tight">
              <span className="block text-white/90">Privacy-First</span>
              <span
                className="block"
                style={{
                  background: 'linear-gradient(135deg, #a78bfa 0%, #60a5fa 50%, #22d3ee 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                AI Education
              </span>
            </h1>

            <p className="text-lg text-white/60 mb-10 leading-relaxed">
              Federated learning meets personalized education. Your data never leaves your school while AI models get smarter together.
            </p>

            <div className="grid grid-cols-3 gap-4">
              {[
                { icon: Network, label: 'Federated Learning', sublabel: 'Privacy by design' },
                { icon: Cpu, label: 'Fine-tuned GenAI', sublabel: 'DistilGPT & TinyLlama' },
                { icon: Braces, label: 'Open Standards', sublabel: 'GDPR compliant' },
              ].map((item) => (
                <div key={item.label} className="group">
                  <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/[0.06] backdrop-blur-sm hover:bg-white/[0.08] transition-all duration-300">
                    <item.icon className="w-5 h-5 text-violet-300/80 mb-2 group-hover:text-violet-200 transition-colors" />
                    <p className="text-xs font-semibold text-white/80">{item.label}</p>
                    <p className="text-[10px] text-white/40 mt-0.5">{item.sublabel}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex -space-x-2">
              {['HH', 'GA', 'RS'].map((initials, i) => (
                <div
                  key={i}
                  className="w-9 h-9 rounded-full border border-white/20 flex items-center justify-center text-[10px] font-semibold backdrop-blur-sm"
                  style={{ background: `rgba(${100 + i * 40}, ${80 + i * 30}, 255, 0.15)` }}
                >
                  {initials}
                </div>
              ))}
            </div>
            <div>
              <p className="text-xs text-white/50">Trusted by <span className="text-white/70 font-medium">500+ European Schools</span></p>
              <div className="flex items-center gap-1 mt-0.5">
                <Shield className="w-3 h-3 text-emerald-400/70" />
                <span className="text-[10px] text-emerald-400/70">GDPR Compliant & EU Data Centers</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-background relative">
        {/* Subtle background pattern */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />

        <div className="w-full max-w-md relative z-10">
          <div className="lg:hidden mb-8 text-center">
            <Logo size="lg" className="justify-center" />
            <p className="text-sm text-muted-foreground mt-2">Federated AI Education Platform</p>
          </div>

          <Card className="border-0 shadow-2xl bg-card/80 backdrop-blur-sm">
            <CardHeader className="text-center pb-2 space-y-3">
              <div
                className="mx-auto w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg"
                style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #6366f1 50%, #3b82f6 100%)' }}
              >
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold tracking-tight">Welcome back</CardTitle>
              <p className="text-sm text-muted-foreground">Sign in to your COPA account</p>
            </CardHeader>

            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-5 pt-2">
                {/* Role Selection - 3 options */}
                <FieldGroup>
                  <FieldLabel className="text-center block mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">Select your role</FieldLabel>
                  <div className="grid grid-cols-3 gap-2">
                    {roles.map((r) => {
                      const isActive = role === r.value
                      return (
                        <button
                          key={r.value}
                          type="button"
                          onClick={() => setRole(r.value)}
                          className={`
                            relative flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all duration-300
                            ${isActive
                              ? 'border-transparent text-white shadow-lg scale-[1.02]'
                              : 'border-border/60 hover:border-primary/30 hover:bg-muted/50 text-foreground'
                            }
                          `}
                          style={isActive ? {
                            background: `linear-gradient(135deg, var(--tw-gradient-stops))`,
                            backgroundImage: r.value === 'student'
                              ? 'linear-gradient(135deg, #06b6d4, #3b82f6, #6366f1)'
                              : r.value === 'teacher'
                              ? 'linear-gradient(135deg, #8b5cf6, #a855f7, #d946ef)'
                              : 'linear-gradient(135deg, #10b981, #14b8a6, #06b6d4)'
                          } : {}}
                        >
                          <r.icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-muted-foreground'}`} />
                          <span className="text-xs font-semibold">{r.label}</span>
                          <span className={`text-[9px] leading-tight ${isActive ? 'text-white/70' : 'text-muted-foreground'}`}>
                            {r.description}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </FieldGroup>

                {/* Organisation Selection */}
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="organisation" className="text-xs font-medium">Organisation</FieldLabel>
                    <Select value={organisationId} onValueChange={setOrganisationId}>
                      <SelectTrigger id="organisation" className="h-11 rounded-xl bg-muted/30 border-border/50">
                        <SelectValue placeholder="Select your organisation" />
                      </SelectTrigger>
                      <SelectContent>
                        {organisations.map((org) => (
                          <SelectItem key={org.id} value={org.id}>
                            {org.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                </FieldGroup>

                {/* Organisation Code Toggle */}
                {!showOrgCode ? (
                  <Button
                    type="button"
                    variant="link"
                    className="px-0 h-auto text-xs text-primary"
                    onClick={() => setShowOrgCode(true)}
                  >
                    Add organisation code
                  </Button>
                ) : (
                  <FieldGroup>
                    <Field>
                      <FieldLabel htmlFor="orgCode" className="text-xs font-medium">Organisation Code</FieldLabel>
                      <Input
                        id="orgCode"
                        value={orgCode}
                        onChange={(e) => setOrgCode(e.target.value)}
                        placeholder="e.g., HHG-BER-2024"
                        className="h-11 rounded-xl bg-muted/30 border-border/50"
                      />
                    </Field>
                  </FieldGroup>
                )}

                {/* Email */}
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="email" className="text-xs font-medium">Email address</FieldLabel>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={
                        role === 'admin'
                          ? 'admin@copa.eu'
                          : role === 'teacher'
                          ? 'maria.schmidt@school.de'
                          : 'max.mueller@student.school.de'
                      }
                      autoComplete="email"
                      className="h-11 rounded-xl bg-muted/30 border-border/50"
                    />
                  </Field>
                </FieldGroup>

                {/* Password */}
                <FieldGroup>
                  <Field>
                    <div className="flex items-center justify-between">
                      <FieldLabel htmlFor="password" className="text-xs font-medium">Password</FieldLabel>
                      <Link href="#" className="text-xs text-primary hover:underline">
                        Forgot password?
                      </Link>
                    </div>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="current-password"
                      className="h-11 rounded-xl bg-muted/30 border-border/50"
                    />
                  </Field>
                </FieldGroup>
              </CardContent>

              <CardFooter className="flex flex-col gap-4 pt-2">
                <Button
                  type="submit"
                  className="w-full h-11 rounded-xl text-white border-0 shadow-lg hover:shadow-xl hover:opacity-90 transition-all font-medium"
                  style={{
                    background: role === 'student'
                      ? 'linear-gradient(135deg, #06b6d4, #3b82f6, #6366f1)'
                      : role === 'teacher'
                      ? 'linear-gradient(135deg, #8b5cf6, #a855f7, #d946ef)'
                      : 'linear-gradient(135deg, #10b981, #14b8a6, #06b6d4)'
                  }}
                  size="lg"
                  disabled={isLoading}
                >
                  {isLoading ? <Spinner className="mr-2" /> : null}
                  Sign in as {role.charAt(0).toUpperCase() + role.slice(1)}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  {"Don't have an account? "}
                  <Link href="/auth/register" className="text-primary font-medium hover:underline">
                    Register
                  </Link>
                </p>
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>

      <style jsx>{`
        @keyframes float1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -30px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        @keyframes float2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(-40px, 20px) scale(1.05); }
          66% { transform: translate(30px, -30px) scale(0.95); }
        }
        @keyframes float3 {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(25px, -25px); }
        }
        @keyframes floatParticle {
          0%, 100% { transform: translateY(0) translateX(0); opacity: 0.3; }
          25% { transform: translateY(-20px) translateX(10px); opacity: 0.6; }
          50% { transform: translateY(-10px) translateX(-5px); opacity: 0.4; }
          75% { transform: translateY(-30px) translateX(15px); opacity: 0.7; }
        }
        @keyframes pulseOpacity {
          0%, 100% { opacity: 0.15; }
          50% { opacity: 0.5; }
        }
        @keyframes pulseScale {
          0%, 100% { r: 0.6; opacity: 0.4; }
          50% { r: 1.2; opacity: 0.8; }
        }
      `}</style>
    </div>
  )
}
