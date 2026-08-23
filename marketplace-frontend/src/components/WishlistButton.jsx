import { Heart } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { addToWishlist, removeFromWishlist } from '@/store/slices/catalogSlice'
import { useToast } from '@/components/ToastProvider'
import { cn } from '@/lib/utils'

export default function WishlistButton({ productId, className, size = 16 }) {
  const dispatch = useDispatch()
  const { showToast } = useToast()
  const isAuthenticated = useSelector((s) => s.auth.isAuthenticated)
  const inWishlist = useSelector((s) => s.catalog.wishlist.includes(productId))

  function toggle(e) {
    e.preventDefault()
    e.stopPropagation()
    if (!isAuthenticated) {
      window.location.href = '/auth?intent=customer'
      return
    }
    dispatch(inWishlist ? removeFromWishlist(productId) : addToWishlist(productId))
      .unwrap()
      .catch((message) => showToast(message || 'Could not update your wishlist', 'error'))
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
      aria-pressed={inWishlist}
      className={cn('shrink-0 p-1.5 rounded-full hover:bg-onLight/5 transition-colors', className)}
    >
      <Heart size={size} className={inWishlist ? 'fill-coral text-coral' : 'text-onLight/40'} />
    </button>
  )
}
