import { motion } from 'framer-motion'

const MotionTag = { div: motion.div, section: motion.section, li: motion.li, span: motion.span }

// Wraps a section so it fades + slides up as it scrolls into view. Uses
// framer-motion's whileInView instead of GSAP/ScrollTrigger — framer-motion
// is already loaded on every route (Button, page transitions), so this
// avoids pulling GSAP into non-landing-page bundles just for a scroll reveal.
export default function Reveal({ children, as = 'div', className = '', delay = 0 }) {
  const Tag = MotionTag[as] || motion.div

  return (
    <Tag
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.9, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </Tag>
  )
}
