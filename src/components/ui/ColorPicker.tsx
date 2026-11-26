import { Button } from './Button'
import { Popover } from '@base-ui/react/popover'
import { Check, CaretDown } from '@phosphor-icons/react'

const swatches = ['#0C0D0E', '#181A1E', '#F2F0EB', '#FFFFFF', '#FF4F00', '#D93F00', '#FF7954', '#2B7FFF', '#0052CC', '#10B981', '#059669', '#F59E0B', '#D97706', '#EF4444', '#DC2626', '#5E6AD2', '#A78BFA', '#EC4899', '#38BDF8', '#84CC16']
interface Props { value: string; label: string; onChange: (value: string) => void }
export function ColorPicker({ value, label, onChange }: Props) {
  return <Popover.Root>
    <Popover.Trigger className="color-picker-trigger" aria-label={`${label} color picker`}><span className="color-picker-swatch" style={{ backgroundColor: /^#[\da-f]{6}$/i.test(value) ? value : 'transparent' }} /><CaretDown size={12} aria-hidden="true" /></Popover.Trigger>
    <Popover.Portal>
      <Popover.Positioner sideOffset={4}>
        <Popover.Popup className="color-picker-menu" aria-label={`${label} color options`}>
          <span className="sr-only">Choose a preset color for {label}</span>
          {swatches.map((color) => <Button key={color} type="button" className="color-picker-option" aria-label={color} aria-pressed={value.toUpperCase() === color} title={color} style={{ backgroundColor: color }} onClick={() => onChange(color)}>{value.toUpperCase() === color && <Check size={12} color={color === '#F2F0EB' || color === '#FFFFFF' || color === '#F59E0B' || color === '#84CC16' ? '#141517' : '#FFFFFF'} />}</Button>)}
        </Popover.Popup>
      </Popover.Positioner>
    </Popover.Portal>
  </Popover.Root>
}
