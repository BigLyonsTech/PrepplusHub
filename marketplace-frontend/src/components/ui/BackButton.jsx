import { ChevronLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

// Explicit destination rather than navigate(-1) — browser history isn't a
// reliable stand-in for "previous step in this flow" (e.g. a user could
// land on /verify-otp from a few different places), and one step in this
// flow (role confirmation) has no safe history target at all once OTP is
// consumed, so every step names where "back" actually goes.
export default function BackButton({ to, className = '' }) {
  const navigate = useNavigate()
  return (
    <button
      type="button"
      onClick={() => navigate(to)}
      className={`inline-flex items-center gap-1 text-sm text-onLight/50 hover:text-onLight/80 transition-colors ${className}`}
    >
      <ChevronLeft size={16} />
      Back
    </button>
  )
}
