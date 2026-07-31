import { Link, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { ShoppingBag, User2 } from 'lucide-react'
import Button from './ui/Button'
import Logo3D from './Logo3D'
import { cn } from '@/lib/utils'
import { logout } from '@/store/slices/authSlice'

const navLinks = [
  { to: '/products', label: 'Browse' },
  { to: '/auth?intent=vendor', label: 'Sell on PrepplusHub' },
]

export default function Navbar() {
  const dispatch = useDispatch()
  const { user, isAuthenticated } = useSelector((s) => s.auth)
  const cartCount = useSelector((s) => s.catalog.cart.reduce((a, c) => a + c.quantity, 0))
  const navigate = useNavigate()

  return (
    <>
      <header className="fixed top-0 inset-x-0 z-40 bg-paper/95 border-b border-onLight/8">
        <nav className="container-page flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2.5 font-display text-xl font-semibold tracking-tight">
            <Logo3D />
            <span className="text-gradient-brand">PrepplusHub</span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.to}
                className="text-sm text-onLight/60 hover:text-leaf-dim hover:bg-leaf/8 rounded-full px-3.5 py-2 transition-colors"
              >
                {link.label}
              </Link>
            ))}
            {user?.role === 'vendor' && (
              <Link
                to="/vendor/dashboard"
                className="text-sm text-onLight/60 hover:text-leaf-dim hover:bg-leaf/8 rounded-full px-3.5 py-2 transition-colors"
              >
                Vendor Dashboard
              </Link>
            )}
            {user?.role === 'customer' && (
              <Link
                to="/customer/dashboard"
                className="text-sm text-onLight/60 hover:text-leaf-dim hover:bg-leaf/8 rounded-full px-3.5 py-2 transition-colors"
              >
                For You
              </Link>
            )}
            {user?.role === 'admin' && (
              <Link
                to="/admin"
                className="text-sm text-onLight/60 hover:text-leaf-dim hover:bg-leaf/8 rounded-full px-3.5 py-2 transition-colors"
              >
                Admin
              </Link>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => navigate(isAuthenticated ? '/checkout' : '/auth?intent=customer')}
              className="relative p-2.5 rounded-full hover:bg-onLight/5 transition-colors"
              aria-label="Cart"
            >
              <ShoppingBag size={19} className="text-onLight/70" strokeWidth={1.75} />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 bg-leaf text-white text-[10px] leading-none w-4 h-4 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
            {isAuthenticated ? (
              <>
                <button
                  onClick={() => navigate('/profile')}
                  className="p-2.5 rounded-full hover:bg-onLight/5 transition-colors"
                  aria-label="Profile"
                >
                  <User2 size={19} className="text-onLight/70" strokeWidth={1.75} />
                </button>
                <button
                  onClick={() => {
                    dispatch(logout())
                    navigate('/')
                  }}
                  className="text-xs text-onLight/50 hover:text-onLight px-2 py-1.5"
                >
                  Log out
                </button>
              </>
            ) : (
              <Button size="md" variant="primary" onClick={() => navigate('/auth')} className={cn('ml-1.5')}>
                Get Started
              </Button>
            )}
          </div>
        </nav>
      </header>
      {/* Fixed header is pulled out of flow, so this spacer holds its place
          in every page that renders Navbar first — keeps h-16 in one spot
          instead of every page needing its own top padding. */}
      <div className="h-16" aria-hidden="true" />
    </>
  )
}
