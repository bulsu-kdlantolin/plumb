import { Select as SelectPrimitive } from '@base-ui/react/select'
import { Check, CaretDown } from '@phosphor-icons/react'

export interface SelectOption { value: string; label: string; disabled?: boolean }
interface SelectProps {
  value: string
  options: SelectOption[]
  onChange: (value: string) => void
  'aria-label': string
  className?: string
  disabled?: boolean
  placeholder?: string
}

export function Select({ value, options, onChange, className = '', disabled = false, placeholder, 'aria-label': label }: SelectProps) {
  return <SelectPrimitive.Root value={value} onValueChange={(nextValue) => onChange(String(nextValue ?? ''))} disabled={disabled} modal={false}>
    <SelectPrimitive.Trigger aria-label={label} className={`site-select-trigger ${className}`}>
      <SelectPrimitive.Value placeholder={placeholder ?? 'Choose an option'} />
      <SelectPrimitive.Icon className="site-select-caret"><CaretDown size={14} aria-hidden="true" /></SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
    <SelectPrimitive.Portal>
      <SelectPrimitive.Positioner sideOffset={4} className="site-select-positioner">
        <SelectPrimitive.Popup className="site-select-menu">
          <SelectPrimitive.List>
            {options.map((option) => <SelectPrimitive.Item key={option.value} value={option.value} disabled={option.disabled} className="site-select-option">
              <SelectPrimitive.ItemText>{option.label}</SelectPrimitive.ItemText>
              <SelectPrimitive.ItemIndicator><Check size={13} aria-hidden="true" /></SelectPrimitive.ItemIndicator>
            </SelectPrimitive.Item>)}
          </SelectPrimitive.List>
        </SelectPrimitive.Popup>
      </SelectPrimitive.Positioner>
    </SelectPrimitive.Portal>
  </SelectPrimitive.Root>
}
