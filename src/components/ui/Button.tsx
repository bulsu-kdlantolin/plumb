import type { ComponentPropsWithRef } from 'react'

export type ButtonProps = ComponentPropsWithRef<'button'>

export function Button({ className = '', ...props }: ButtonProps) {
  return <button {...props} className={`plumb-button ${className}`} />
}
