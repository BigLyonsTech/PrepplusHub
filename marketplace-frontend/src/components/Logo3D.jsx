import { motion } from 'framer-motion'
import logoImg from '@/assets/prepplus-logo.png'

const faceBase =
  'absolute inset-0 rounded-[9px] [backface-visibility:hidden] overflow-hidden flex items-center justify-center'

// A small always-on 3D flip, built from two backface-hidden faces rotating on
// the Y axis — reads as a real 3D mark without pulling in a WebGL library
// (three.js was deliberately dropped from this project for bundle weight,
// and the navbar renders on every route, so it has to stay this light). Both
// faces show the same logo image — the back face's img is additionally
// mirrored with scaleX(-1) to cancel out the rotateY(180deg) flip, so it
// reads correctly (not backwards) as it comes into view mid-spin.
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
        <span className={faceBase} style={{ transform: 'rotateY(180deg)' }}>
          <img
            src={logoImg}
            alt="PrepplusHub"
            className="w-full h-full object-contain"
            style={{ transform: 'scaleX(-1)' }}
          />
        </span>
      </motion.span>
    </span>
  )
}
