import { Checkbox as CheckboxPrimitive } from '@base-ui/react/checkbox'
import { motion, useReducedMotion } from 'motion/react'
import type { ComponentProps } from 'react'

type Props = Omit<ComponentProps<typeof CheckboxPrimitive.Root>, 'checked' | 'onCheckedChange'> & {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
}

export function Checkbox({ checked, onCheckedChange, className = '', ...props }: Props) {
  const reduceMotion = useReducedMotion()
  return <CheckboxPrimitive.Root {...props} checked={checked} onCheckedChange={(value) => onCheckedChange(value === true)} className={`plumb-checkbox ${className}`}>
    <CheckboxPrimitive.Indicator className="plumb-checkbox-indicator">
      <svg viewBox="0 0 12 12" width="12" height="12" aria-hidden="true">
        <motion.path d="m2 6 2.5 2.5L10 3" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="square" strokeLinejoin="miter" initial={false} animate={{ pathLength: checked ? 1 : 0, opacity: checked ? 1 : 0 }} transition={{ duration: reduceMotion ? 0 : 0.14, ease: [0.25, 0.46, 0.45, 0.94] }} />
      </svg>
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
}
