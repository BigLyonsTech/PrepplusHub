import { motion } from 'framer-motion'
import { Leaf } from 'lucide-react'
import logoImg from '@/assets/prepplus-logo.png'

const faceBase =
  'absolute inset-0 rounded-[9px] [backface-visibility:hidden] overflow-hidden flex items-center justify-center'

// A small always-on 3D flip, built from two backface-hidden faces rotating on
// the Y axis — reads as a real 3D mark without pulling in a WebGL library
// (three.js was deliberately dropped from this project for bundle weight,
// and the navbar renders on every route, so it has to stay this light). The
// front face is the real brand logo; the back reuses the logo's own leaf
// motif on a brand-gradient panel rather than a mirrored copy of the full
// image, since a raster logo with text would read backwards for half of
// every spin otherwise.
export default function Logo3D({ size = 40 }) {
  return (
    <span
      className="relative inline-block shrink-0"
      style={{ width: size, height: size, perspective: 400 }}
    >
      <span
        className="absolute -inset-1.5 rounded-full bg-leaf/35 blur-md"
        aria-hidden="true"
      />
      <motion.span
        className="relative block h-full w-full"
        style={{ transformStyle: 'preserve-3d' }}
        animate={{ rotateY: 360 }}
        transition={{ duration: 9, repeat: Infinity, ease: 'linear' }}
        whileHover={{ scale: 1.08 }}
      >
        <span className={faceBase}>
          <img src={logoImg} alt="PrepplusHub" className="w-full h-full object-contain" />
        </span>
        <span
          className={faceBase}
          style={{
            transform: 'rotateY(180deg)',
            background: 'linear-gradient(135deg, var(--color-leaf), var(--color-leaf-dim))',
          }}
        >
          <Leaf size={size * 0.55} className="text-white/90" strokeWidth={1.75} />
        </span>
      </motion.span>
    </span>
  )
}
