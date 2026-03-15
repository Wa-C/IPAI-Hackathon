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
import { GraduationCap, BookOpen, ArrowRight, Users, Sparkles, Shield } from 'lucide-react'
import type { UserRole } from '@/lib/types'

export default function RegisterPage() {
  const router = useRouter()
  const { login, organisations, isLoading } = useAuth()
  
  const [role, setRole] = useState<UserRole>('teacher')
  const [organisationId, setOrganisationId] = useState(organisations[0]?.id || '')
  const [orgCode, setOrgCode] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await login(role, organisationId)
    router.push(role === 'teacher' ? '/teacher/dashboard' : '/student/dashboard')
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 gradient-primary relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-48 h-48 rounded-full bg-white/10 blur-3xl" />
        </div>
        <div className="relative z-10 flex flex-col justify-between p-12 text-white">
          <Logo size="lg" className="[&_span]:text-white [&_div]:bg-white/20" />
          <div>
            <h1 className="text-4xl font-bold mb-6 leading-tight">
              Start your journey to smarter education
            </h1>
            <p className="text-lg text-white/80 mb-8">
              Create your account and join thousands of educators transforming the way students learn.
            </p>
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-white/80">
                <div className="p-2 rounded-lg bg-white/10">
                  <Sparkles className="w-5 h-5" />
                </div>
                <span>AI-powered lesson creation</span>
              </div>
              <div className="flex items-center gap-3 text-white/80">
                <div className="p-2 rounded-lg bg-white/10">
                  <Users className="w-5 h-5" />
                </div>
                <span>Personalized for every student</span>
              </div>
              <div className="flex items-center gap-3 text-white/80">
                <div className="p-2 rounded-lg bg-white/10">
                  <Shield className="w-5 h-5" />
                </div>
                <span>GDPR compliant and secure</span>
              </div>
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
            <p className="text-sm text-white/70">Join 50,000+ educators</p>
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-background overflow-y-auto">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8 text-center">
            <Logo size="lg" className="justify-center" />
          </div>

          <Card className="border-0 shadow-2xl bg-card/50 backdrop-blur">
            <CardHeader className="text-center pb-2 space-y-4">
              <div className="mx-auto w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center shadow-lg">
                <Users className="w-7 h-7 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold">Create your account</CardTitle>
              <CardDescription>Join COPA to start personalized learning</CardDescription>
            </CardHeader>
            
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-5">
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
                      className="flex items-center gap-2 h-14 rounded-xl border-2 data-[state=on]:gradient-primary data-[state=on]:text-white data-[state=on]:border-transparent"
                    >
                      <BookOpen className="h-5 w-5" />
                      <span className="font-medium">Teacher</span>
                    </ToggleGroupItem>
                    <ToggleGroupItem
                      value="student"
                      aria-label="Student"
                      className="flex items-center gap-2 h-14 rounded-xl border-2 data-[state=on]:gradient-primary data-[state=on]:text-white data-[state=on]:border-transparent"
                    >
                      <GraduationCap className="h-5 w-5" />
                      <span className="font-medium">Student</span>
                    </ToggleGroupItem>
                  </ToggleGroup>
                </FieldGroup>

                {/* Organisation Code */}
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="orgCode">Organisation Code</FieldLabel>
                    <Input
                      id="orgCode"
                      value={orgCode}
                      onChange={(e) => setOrgCode(e.target.value)}
                      placeholder="Enter code from your school"
                      className="h-12 rounded-xl"
                      required
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Ask your school administrator for this code
                    </p>
                  </Field>
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

                {/* Name */}
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="name">Full Name</FieldLabel>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your full name"
                      autoComplete="name"
                      className="h-12 rounded-xl"
                      required
                    />
                  </Field>
                </FieldGroup>

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
                      required
                    />
                  </Field>
                </FieldGroup>

                {/* Password */}
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="password">Password</FieldLabel>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="new-password"
                      className="h-12 rounded-xl"
                      required
                    />
                  </Field>
                </FieldGroup>

                {/* Confirm Password */}
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="confirmPassword">Confirm Password</FieldLabel>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      autoComplete="new-password"
                      className="h-12 rounded-xl"
                      required
                    />
                  </Field>
                </FieldGroup>
              </CardContent>

              <CardFooter className="flex flex-col gap-4">
                <Button 
                  type="submit" 
                  className="w-full h-12 rounded-xl gradient-primary text-white border-0 shadow-lg hover:shadow-xl transition-all" 
                  size="lg" 
                  disabled={isLoading}
                >
                  {isLoading ? <Spinner className="mr-2" /> : null}
                  Create Account
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <p className="text-sm text-muted-foreground text-center">
                  Already have an account?{' '}
                  <Link href="/auth/login" className="text-primary font-medium hover:underline">
                    Sign in
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
