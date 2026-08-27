import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { loginWithGoogle } from '@/store/slices/authSlice'
import { useToast } from '@/components/ToastProvider'
import { routeForUser } from '@/lib/routing'

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID

export default function GoogleSignInButton() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const buttonRef = useRef(null)

  useEffect(() => {
    if (!CLIENT_ID) return

    function handleCredential(response) {
      dispatch(loginWithGoogle(response.credential)).then((result) => {
        if (loginWithGoogle.fulfilled.match(result)) {
          navigate(routeForUser(result.payload.user))
        } else {
          showToast(result.payload || 'Google sign-in failed', 'error')
        }
      })
    }

    function render() {
      if (!window.google?.accounts?.id || !buttonRef.current) return
      window.google.accounts.id.initialize({ client_id: CLIENT_ID, callback: handleCredential })
      window.google.accounts.id.renderButton(buttonRef.current, {
        theme: 'outline',
        size: 'large',
        width: 320,
      })
    }

    if (window.google?.accounts?.id) {
      render()
      return
    }

    // Google's client is meant to be loaded once and reused, so this is
    // deliberately not cleaned up on unmount — a second mount just re-renders
    // the button into whatever div is current at that point.
    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    script.onload = render
    document.head.appendChild(script)
  }, [dispatch, navigate, showToast])

  if (!CLIENT_ID) return null

  return <div ref={buttonRef} className="flex justify-center" />
}
