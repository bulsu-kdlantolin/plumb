import type { ComponentProps } from 'react'

export function TextInput({ className = '', ...props }: ComponentProps<'input'>) {
  return <input {...props} className={`plumb-input ${className}`} />
}

export function TextArea({ className = '', ...props }: ComponentProps<'textarea'>) {
  return <textarea {...props} className={`plumb-input plumb-textarea ${className}`} />
}
