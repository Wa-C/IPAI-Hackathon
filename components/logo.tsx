import { cn } from '@/lib/utils'

interface LogoProps {
  className?: string
  showText?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export function Logo({ className, showText = false, size = 'md' }: LogoProps) {
  const sizes = {
    sm: { icon: 'h-6 w-auto', text: 'text-lg' },
    md: { icon: 'h-8 w-auto', text: 'text-xl' },
    lg: { icon: 'h-10 w-auto', text: 'text-2xl' },
  }

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <div className={cn('relative flex items-center justify-center shrink-0', sizes[size].icon)}>
        <img 
          src="/copa_logo.png" 
          alt="COPA Logo" 
          className="h-full w-auto object-contain"
        />
      </div>
      {showText && (
        <span className={cn('font-black tracking-tight text-[#0A1A3F]', sizes[size].text)}>
          CO<span style={{ 
            background: 'linear-gradient(135deg, #0066FF 0%, #22d3ee 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>PA</span>
        </span>
      )}
    </div>
  )
}
