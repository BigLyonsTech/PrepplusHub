import { cn } from '@/lib/utils'

export default function FormError({ children, className }) {
  if (!children) return null
  return <p className={cn('text-sm text-coral', className)}>{children}</p>
}
