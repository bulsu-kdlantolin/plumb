import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useRef, useState, type MouseEvent, type ReactNode } from 'react'

interface Spark { id: number; x: number; y: number }

/** A restrained click response for discrete canvas commands; it never wraps the draggable viewport. */
export function ClickSpark({ children }: { children: ReactNode }) {
  const reducedMotion = useReducedMotion()
  const [sparks, setSparks] = useState<Spark[]>([])
  const nextId = useRef(0)

  const handleClick = (event: MouseEvent<HTMLSpanElement>) => {
    if (reducedMotion) return
    const bounds = event.currentTarget.getBoundingClientRect()
    const spark = { id: ++nextId.current, x: event.clientX - bounds.left, y: event.clientY - bounds.top }
    setSparks((current) => [...current.slice(-3), spark])
  }

  return <span className="click-spark-target" onClick={handleClick}>
    {children}
    <AnimatePresence>{sparks.map((spark) => <motion.span className="click-spark-burst" key={spark.id} style={{ left: spark.x, top: spark.y }} initial={{ opacity: 1 }} animate={{ opacity: 1 }} transition={{ duration: 0.14 }} onAnimationComplete={() => setSparks((current) => current.filter((item) => item.id !== spark.id))} aria-hidden="true">
      {Array.from({ length: 4 }, (_, index) => {
        const angle = index * Math.PI / 2
        return <motion.i key={index} initial={{ x: 0, y: 0, scale: 0.8, opacity: 0.9 }} animate={{ x: Math.cos(angle) * 13, y: Math.sin(angle) * 13, scale: 0.35, opacity: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.14, ease: [0.25, 0.46, 0.45, 0.94] }} />
      })}
    </motion.span>)}</AnimatePresence>
  </span>
}
