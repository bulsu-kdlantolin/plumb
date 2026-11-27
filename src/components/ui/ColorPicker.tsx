import { Button } from './Button'
import { Popover } from '@base-ui/react/popover'
import { Check, CaretDown } from '@phosphor-icons/react'

const swatches = ['#0A0808', '#181212', '#F0EAE6', '#FFFFFF', '#CD412B', '#B83521', '#DF4C35', '#4B83A6', '#365F79', '#5A9E6F', '#34734A', '#D9822B', '#A8531F', '#E03E3E', '#B52C31']
interface Props { value: string; label: string; onChange: (value: string) => void }
export function ColorPicker({ value, label, onChange }: Props) {
  return <Popover.Root>
    <Popover.Trigger className="color-picker-trigger" aria-label={`${label} color picker`}><span className="color-picker-swatch" style={{ backgroundColor: /^#[\da-f]{6}$/i.test(value) ? value : 'transparent' }} /><CaretDown size={12} aria-hidden="true" /></Popover.Trigger>
    <Popover.Portal>
      <Popover.Positioner sideOffset={4}>
        <Popover.Popup className="color-picker-menu" aria-label={`${label} color options`}>
          <span className="sr-only">Choose a preset color for {label}</span>
          {swatches.map((color) => <Button key={color} type="button" className="color-picker-option" aria-label={color} aria-pressed={value.toUpperCase() === color} title={color} style={{ backgroundColor: color }} onClick={() => onChange(color)}>{value.toUpperCase() === color && <Check size={12} color={color === '#F0EAE6' || color === '#FFFFFF' || color === '#D9822B' ? '#211916' : '#FFFFFF'} />}</Button>)}
        </Popover.Popup>
      </Popover.Positioner>
    </Popover.Portal>
  </Popover.Root>
}
