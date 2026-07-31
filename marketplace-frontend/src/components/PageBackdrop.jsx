import { cn } from '@/lib/utils'

// The landing hero's grain + ambient blur-orb treatment, factored out so
// every other route shares the same tactile backdrop instead of just the
// marketing page. Orbs sit at the top of the wrapper (not the viewport),
// so on tall/scrolling pages they read as a page-header accent rather than
// following the user down the page.
export default function PageBackdrop({ children, className }) {
  return (
    <div className={cn('min-h-screen bg-paper relative overflow-hidden grain-overlay', className)}>
      <div className="absolute inset-0 market-dots pointer-events-none" aria-hidden="true" />
      <div
        className="absolute -top-24 -right-24 w-[420px] h-[420px] rounded-full bg-leaf/15 blur-[100px] pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute top-40 -left-24 w-[320px] h-[320px] rounded-full bg-canopy/10 blur-[90px] pointer-events-none"
        aria-hidden="true"
      />
      <div className="relative z-10">{children}</div>
    </div>
  )
}
