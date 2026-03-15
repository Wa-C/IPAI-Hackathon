import { cn } from '@/lib/utils'

interface LogoProps {
  className?: string
  showText?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export function Logo({ className, showText = true, size = 'md' }: LogoProps) {
  const sizes = {
    sm: { icon: 'w-7 h-7', text: 'text-lg' },
    md: { icon: 'w-9 h-9', text: 'text-xl' },
    lg: { icon: 'w-11 h-11', text: 'text-2xl' },
  }

  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <div 
        className={cn(
          'rounded-xl flex items-center justify-center shadow-lg',
          sizes[size].icon
        )}
        style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #6366f1 50%, #3b82f6 100%)' }}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-5 h-5 text-white"
        >
          <path
            d="M12 2L2 7l10 5 10-5-10-5z"
            fill="currentColor"
            opacity="0.9"
          />
          <path
            d="M2 17l10 5 10-5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M2 12l10 5 10-5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.7"
          />
        </svg>
      </div>
      {showText && (
        <span className={cn('font-bold tracking-tight text-foreground', sizes[size].text)}>
          CO<span style={{
            background: 'linear-gradient(135deg, #7c3aed 0%, #3b82f6 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>PA</span>
        </span>
      )}
    </div>
  )
}
