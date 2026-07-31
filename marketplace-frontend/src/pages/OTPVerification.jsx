import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import Navbar from '@/components/Navbar'
import PageBackdrop from '@/components/PageBackdrop'
import Button from '@/components/ui/Button'
import { verifyOtp } from '@/store/slices/authSlice'
import { api } from '@/lib/api'

export default function OTPVerification() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const pendingEmail = useSelector((s) => s.auth.pendingEmail)
  const devOtp = useSelector((s) => s.auth.devOtp)
  const authError = useSelector((s) => s.auth.error)
  const status = useSelector((s) => s.auth.status)
  const [digits, setDigits] = useState(['', '', '', '', '', ''])
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const refs = useRef([])

  function handleChange(i, val) {
    if (!/^\d?$/.test(val)) return
    const next = [...digits]
    next[i] = val
    setDigits(next)
    if (val && i < 5) refs.current[i + 1]?.focus()
  }

  function handleKeyDown(i, e) {
    if (e.key === 'Backspace' && !digits[i] && i > 0) {
      refs.current[i - 1]?.focus()
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const code = digits.join('')
    if (code.length !== 6) {
      setError('Enter all 6 digits.')
      return
    }
    if (!pendingEmail) {
      setError('No pending email. Please register again.')
      return
    }
    setError('')
    const result = await dispatch(verifyOtp({ email: pendingEmail, code }))
    if (verifyOtp.fulfilled.match(result)) {
      navigate('/role-confirmation')
    }
  }

  async function handleResend() {
    if (!pendingEmail) return
    try {
      const res = await api.resendOtp(pendingEmail)
      setInfo(res.devOtp ? `New code (dev): ${res.devOtp}` : 'A new code was sent.')
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <PageBackdrop>
      <Navbar />
      <div className="container-page py-24 flex justify-center">
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm text-center"
        >
          <h1 className="font-display text-3xl font-semibold mb-2">Verify your email</h1>
          <p className="text-onLight/50 mb-4 text-sm">
            We sent a 6-digit code to {pendingEmail || 'your email'}.
          </p>
          {devOtp && (
            <p className="text-xs text-amber bg-amber/10 rounded-lg px-3 py-2 mb-6">
              Dev OTP: <strong>{devOtp}</strong> (shown because email is not configured yet)
            </p>
          )}
          <div className="flex justify-center gap-2 mb-4">
            {digits.map((d, i) => (
              <input
                key={i}
                ref={(el) => (refs.current[i] = el)}
                value={d}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                maxLength={1}
                inputMode="numeric"
                className="w-11 h-12 text-center text-lg rounded-xl border border-onLight/15 bg-white focus:border-leaf focus:ring-1 focus:ring-leaf outline-none"
              />
            ))}
          </div>
          {(error || authError) && (
            <p className="text-sm text-coral mb-3">{error || authError}</p>
          )}
          {info && <p className="text-sm text-leaf mb-3">{info}</p>}
          <Button type="submit" size="lg" className="w-full" disabled={status === 'loading'}>
            {status === 'loading' ? 'Verifying…' : 'Verify'}
          </Button>
          <button type="button" onClick={handleResend} className="mt-4 text-sm text-onLight/50 hover:text-leaf">
            Resend code
          </button>
        </motion.form>
      </div>
    </PageBackdrop>
  )
}
