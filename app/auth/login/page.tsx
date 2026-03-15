'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { Logo } from '@/components/logo'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { Spinner } from '@/components/ui/spinner'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { GraduationCap, BookOpen, Sparkles, ArrowRight, Shield } from 'lucide-react'
import type { UserRole } from '@/lib/types'

export default function LoginPage() {
  const router = useRouter()
  const { login, organisations, isLoading } = useAuth()

  const [role, setRole] = useState<UserRole>('teacher')
  const [organisationId, setOrganisationId] = useState(organisations[0]?.id || '')
  const [orgCode, setOrgCode] = useState('')
  const [showOrgCode, setShowOrgCode] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await login(role, organisationId)
    router.push(role === 'teacher' ? '/teacher/dashboard' : '/student/dashboard')
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding */}
      <div
        className="hidden lg:flex lg:w-1/2 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #1E293B 0%, #0066FF 100%)' }}
      >
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-48 h-48 rounded-full bg-white/10 blur-3xl" />
        </div>
        <div className="relative z-10 flex flex-col justify-between p-12 text-white">
          <Logo size="lg" className="[&_span]:text-white [&_div]:bg-white/20" />
          <div>
            <h1 className="text-4xl font-bold mb-6 leading-tight">
              Welcome back to smarter teaching
            </h1>
            <p className="text-lg text-white/80 mb-8">
              Join 500+ schools using AI to create inclusive, personalized learning experiences.
            </p>
            <div className="flex items-center gap-3 text-sm text-white/70">
              <Shield className="w-5 h-5" />
              <span>GDPR compliant and privacy-first</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex -space-x-2">
              {['MK', 'TS', 'AW', 'PL'].map((initials, i) => (
                <div key={i} className="w-10 h-10 rounded-full bg-white/20 border-2 border-white/30 flex items-center justify-center text-xs font-medium">
                  {initials}
                </div>
              ))}
            </div>
            <p className="text-sm text-white/70">Trusted by 50,000+ educators</p>
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-background">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8 text-center">
            <Logo size="lg" className="justify-center" />
          </div>

          <Card className="border-0 shadow-2xl bg-card/50 backdrop-blur">
            <CardHeader className="text-center pb-2 space-y-4">
              <div
                className="mx-auto w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg"
                style={{ background: 'linear-gradient(135deg, #1E293B 0%, #0066FF 100%)' }}
              >
                <Sparkles className="w-7 h-7 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
              <CardDescription>Sign in to your COPA account</CardDescription>
            </CardHeader>

            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-6">
                {/* Role Selection */}
                <FieldGroup>
                  <FieldLabel className="text-center block mb-3">I am a...</FieldLabel>
                  <ToggleGroup
                    type="single"
                    value={role}
                    onValueChange={(value) => value && setRole(value as UserRole)}
                    className="grid grid-cols-2 gap-3"
                  >
                    <ToggleGroupItem
                      value="teacher"
                      aria-label="Teacher"
                      className="flex items-center gap-2 h-14 rounded-xl border-2 data-[state=on]:text-white data-[state=on]:border-transparent"
                      style={role === 'teacher' ? { background: 'linear-gradient(135deg, #1E293B 0%, #0066FF 100%)' } : {}}
                    >
                      <BookOpen className="h-5 w-5" />
                      <span className="font-medium">Teacher</span>
                    </ToggleGroupItem>
                    <ToggleGroupItem
                      value="student"
                      aria-label="Student"
                      className="flex items-center gap-2 h-14 rounded-xl border-2 data-[state=on]:text-white data-[state=on]:border-transparent"
                      style={role === 'student' ? { background: 'linear-gradient(135deg, #1E293B 0%, #0066FF 100%)' } : {}}
                    >
                      <GraduationCap className="h-5 w-5" />
                      <span className="font-medium">Student</span>
                    </ToggleGroupItem>
                  </ToggleGroup>
                </FieldGroup>

                {/* Organisation Selection */}
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="organisation">Organisation</FieldLabel>
                    <Select value={organisationId} onValueChange={setOrganisationId}>
                      <SelectTrigger id="organisation" className="h-12 rounded-xl">
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
                    className="px-0 h-auto text-sm text-primary"
                    onClick={() => setShowOrgCode(true)}
                  >
                    Add organisation code
                  </Button>
                ) : (
                  <FieldGroup>
                    <Field>
                      <FieldLabel htmlFor="orgCode">Organisation Code</FieldLabel>
                      <Input
                        id="orgCode"
                        value={orgCode}
                        onChange={(e) => setOrgCode(e.target.value)}
                        placeholder="e.g., HHG-BER-2024"
                        className="h-12 rounded-xl"
                      />
                    </Field>
                  </FieldGroup>
                )}

                {/* Email */}
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="email">Email address</FieldLabel>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={role === 'teacher' ? 'maria.schmidt@school.de' : 'max.mueller@student.school.de'}
                      autoComplete="email"
                      className="h-12 rounded-xl"
                    />
                  </Field>
                </FieldGroup>

                {/* Password */}
                <FieldGroup>
                  <Field>
                    <div className="flex items-center justify-between">
                      <FieldLabel htmlFor="password">Password</FieldLabel>
                      <Link href="#" className="text-sm text-primary hover:underline">
                        Forgot password?
                      </Link>
                    </div>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="current-password"
                      className="h-12 rounded-xl"
                    />
                  </Field>
                </FieldGroup>
              </CardContent>

              <CardFooter className="flex flex-col gap-4">
                <Button
                  type="submit"
                  className="w-full h-12 rounded-xl text-white border-0 shadow-lg hover:shadow-xl hover:opacity-90 transition-all" 
                  style={{ background: 'linear-gradient(135deg, #1E293B 0%, #0066FF 100%)' }}
                  size="lg" 
                  disabled={isLoading}
                >
                  {isLoading ? <Spinner className="mr-2" /> : null}
                  Sign in
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <p className="text-sm text-muted-foreground text-center">
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
    </div>
  )
}
