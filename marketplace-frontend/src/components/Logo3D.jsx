import { motion } from 'framer-motion'

const faceBase =
  'absolute inset-0 flex items-center justify-center rounded-[9px] font-display font-semibold text-[15px] leading-none [backface-visibility:hidden]'

// A small always-on 3D flip, built from two backface-hidden faces rotating on
// the Y axis — reads as a real 3D mark without pulling in a WebGL library
// (three.js was deliberately dropped from this project for bundle weight,
// and the navbar renders on every route, so it has to stay this light).
export default function Logo3D({ size = 30 }) {
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
        <span
          className={`${faceBase} text-ink dark:text-white`}
          style={{
            background: 'linear-gradient(135deg, var(--color-leaf), var(--color-leaf-dim))',
          }}
        >
          P
        </span>
        <span
          className={faceBase}
          style={{
            transform: 'rotateY(180deg)',
            background: 'linear-gradient(135deg, var(--color-canopy), var(--color-ink))',
            color: 'var(--color-onDark)',
          }}
        >
          P
        </span>
      </motion.span>
    </span>
  )
}
