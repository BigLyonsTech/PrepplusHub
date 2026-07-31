import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import Navbar from '@/components/Navbar'
import PageBackdrop from '@/components/PageBackdrop'
import Button from '@/components/ui/Button'
import { Field, Input } from '@/components/ui/Input'
import { loginUser } from '@/store/slices/authSlice'

function routeForUser(user) {
  if (!user) return '/role-confirmation'
  if (user.role === 'admin') return '/admin'
  if (user.role === 'vendor') {
    if (!user.vendorVerificationStatus) return '/onboarding/vendor'
    return '/vendor/dashboard'
  }
  if (user.role === 'customer') {
    if (user.onboardingStage === 'personalizing') return '/onboarding/quiz'
    return '/customer/dashboard'
  }
  if (user.onboardingStage === 'role_selection' || !user.role) return '/role-confirmation'
  return '/customer/dashboard'
}

export default function Login() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const authError = useSelector((s) => s.auth.error)
  const status = useSelector((s) => s.auth.status)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [localError, setLocalError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setLocalError('')
    const result = await dispatch(loginUser({ email, password }))
    if (loginUser.fulfilled.match(result)) {
      const payload = result.payload
      if (payload.pendingEmail && !payload.token) {
        navigate('/verify-otp')
        return
      }
      navigate(routeForUser(payload.user))
    } else {
      setLocalError(result.payload || 'Login failed')
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
          className="w-full max-w-sm"
        >
          <h1 className="font-display text-3xl font-semibold mb-8 text-center">Log in</h1>
          <div className="space-y-4">
            <Field label="Email">
              <Input
                type="email"
                placeholder="you@email.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Field>
            <Field label="Password">
              <Input
                type="password"
                placeholder="••••••••"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Field>
          </div>
          {(localError || authError) && (
            <p className="text-sm text-coral mt-4">{localError || authError}</p>
          )}
          <Button type="submit" size="lg" className="w-full mt-8" disabled={status === 'loading'}>
            {status === 'loading' ? 'Signing in…' : 'Log in'}
          </Button>
          <p className="text-center text-xs text-onLight/40 mt-4">
            Demo admin: admin@prepplushub.com / admin12345
          </p>
        </motion.form>
      </div>
    </PageBackdrop>
  )
}
