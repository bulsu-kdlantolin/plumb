import { useEffect } from 'react'
import { animate, motion, useMotionValue, useReducedMotion, useTransform } from 'motion/react'

export function AlignmentScore({ score }: { score: number | null }) {
  const reducedMotion = useReducedMotion()
  const value = useMotionValue(score ?? 0)
  const rounded = useTransform(value, (current) => Math.round(current).toString())

  useEffect(() => {
    if (score === null) {
      value.set(0)
      return
    }
    const controls = animate(value, score, { duration: reducedMotion ? 0 : 0.14, ease: [0.25, 0.46, 0.45, 0.94] })
    return () => controls.stop()
  }, [reducedMotion, score, value])

  return <span className="alignment-pill" aria-label={`Alignment score ${score === null ? 'not available' : `${score} out of 100`}`}>
    <span>ALIGNMENT:</span>
    <strong><motion.span aria-hidden="true">{score === null ? '—' : rounded}</motion.span><span aria-hidden="true">/100</span></strong>
  </span>
}
