import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { ShoppingBag, User2, Search, X } from 'lucide-react'
import Button from './ui/Button'
import Logo3D from './Logo3D'
import ThemeToggle from './ThemeToggle'
import { cn } from '@/lib/utils'
import { logout } from '@/store/slices/authSlice'
import { fetchCart } from '@/store/slices/catalogSlice'

const navLinks = [
  { to: '/products', label: 'Browse' },
  { to: '/auth?intent=vendor', label: 'Sell on PrepplusHub' },
]

export default function Navbar() {
  const dispatch = useDispatch()
  const { user, isAuthenticated } = useSelector((s) => s.auth)
  const cartCount = useSelector((s) => s.catalog.cart.reduce((a, c) => a + c.quantity, 0))
  const cartStatus = useSelector((s) => s.catalog.cartStatus)
  const navigate = useNavigate()
  const [searchOpen, setSearchOpen] = useState(false)
  const [query, setQuery] = useState('')

  function submitSearch(e) {
    e.preventDefault()
    const q = query.trim()
    if (!q) return
    navigate(`/products?q=${encodeURIComponent(q)}`)
    setSearchOpen(false)
    setQuery('')
  }

  // Navbar is rendered fresh on every page (not a persistent layout), so the
  // badge would otherwise only reflect the cart after visiting Cart/Checkout.
  // cartStatus gates this to a one-time fetch per session, not per navigation.
  useEffect(() => {
    if (isAuthenticated && cartStatus === 'idle') dispatch(fetchCart())
  }, [dispatch, isAuthenticated, cartStatus])

  return (
    <>
      <header className="fixed top-0 inset-x-0 z-40 bg-paper/95 border-b border-onLight/8">
        <nav className="container-page flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2.5 font-display text-xl font-semibold tracking-tight">
            <Logo3D />
            <span className="text-gradient-brand">PrepplusHub</span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navLinks
              .filter((link) => user?.role !== 'vendor' || link.label !== 'Sell on PrepplusHub')
              .map((link) => (
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
                to={
                  !user.vendorVerificationStatus || user.vendorVerificationStatus === 'rejected'
                    ? '/onboarding/vendor'
                    : '/vendor/dashboard'
                }
                className="text-sm text-onLight/60 hover:text-leaf-dim hover:bg-leaf/8 rounded-full px-3.5 py-2 transition-colors"
              >
                {!user.vendorVerificationStatus || user.vendorVerificationStatus === 'rejected'
                  ? 'Complete Application'
                  : 'Vendor Dashboard'}
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
            {searchOpen ? (
              <form onSubmit={submitSearch} className="flex items-center">
                <input
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onBlur={() => !query && setSearchOpen(false)}
                  placeholder="Search products…"
                  className="w-36 sm:w-52 h-9 px-3 rounded-full border border-onLight/15 bg-surface text-sm outline-none focus:border-leaf"
                />
                <button
                  type="button"
                  onClick={() => {
                    setSearchOpen(false)
                    setQuery('')
                  }}
                  aria-label="Close search"
                  className="p-2.5 rounded-full hover:bg-onLight/5 transition-colors"
                >
                  <X size={17} className="text-onLight/60" strokeWidth={1.75} />
                </button>
              </form>
            ) : (
              <button
                onClick={() => setSearchOpen(true)}
                className="p-2.5 rounded-full hover:bg-onLight/5 transition-colors"
                aria-label="Search"
              >
                <Search size={19} className="text-onLight/70" strokeWidth={1.75} />
              </button>
            )}
            <ThemeToggle />
            <button
              onClick={() => navigate('/checkout')}
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
