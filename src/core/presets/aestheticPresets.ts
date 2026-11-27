import type { ProjectSpec } from '../../types/spec.types'

export interface AestheticPreset {
  id: string
  name: string
  summary: string
  tokens: ProjectSpec['designTokens']
}

export const AESTHETIC_PRESETS: AestheticPreset[] = [
  { id: 'carbon-drafting-slate', name: 'Carbon Drafting Slate', summary: 'Soot-black surfaces with oxidized iron and Rust Red active marks.', tokens: { presetId: 'carbon-drafting-slate', themePolarity: 'dark', colors: { canvas: '#0A0808', panel: '#110D0D', surface: '#181212', elevated: '#221919', primary: '#F0EAE6', secondary: '#A89B96', accent: '#CD412B', blueprint: '#4B83A6' }, typography: { heading: 'Space Grotesk', body: 'Plus Jakarta Sans', mono: 'JetBrains Mono', scale: ['10px', '12px', '14px', '18px', '28px'] }, geometry: { borderRadius: [0, 2], borderWidth: 1, gridSize: 16 }, bannedPatterns: ['purple gradients', 'ambient blur blobs', 'floating shadow cards', 'bouncy spring animations'] } },
  { id: 'warm-vellum-editorial', name: 'Warm Vellum Editorial', summary: 'Paper-like warmth with measured editorial typography.', tokens: { presetId: 'warm-vellum-editorial', themePolarity: 'light', colors: { canvas: '#EFECE8', panel: '#F7F5F2', surface: '#FFFFFF', elevated: '#E6E0DA', primary: '#211916', secondary: '#514541', accent: '#B83521', blueprint: '#365F79' }, typography: { heading: 'Newsreader', body: 'Plus Jakarta Sans', mono: 'JetBrains Mono', scale: ['10px', '12px', '14px', '18px', '30px'] }, geometry: { borderRadius: [0, 2], borderWidth: 1, gridSize: 16 }, bannedPatterns: ['purple gradients', 'ambient blur blobs', 'floating shadow cards', 'pill-shaped panels'] } },
  { id: 'high-density-terminal', name: 'High-Density Terminal', summary: 'Compact data surfaces and precise status colors.', tokens: { presetId: 'high-density-terminal', themePolarity: 'dark', colors: { canvas: '#101312', panel: '#151A18', surface: '#1B211E', elevated: '#242D28', primary: '#E5EEE8', secondary: '#A3B4A8', accent: '#A3D977', blueprint: '#62B6CB' }, typography: { heading: 'IBM Plex Sans', body: 'IBM Plex Sans', mono: 'IBM Plex Mono', scale: ['9px', '11px', '13px', '16px', '24px'] }, geometry: { borderRadius: [0, 2], borderWidth: 1, gridSize: 16 }, bannedPatterns: ['purple gradients', 'ambient blur blobs', 'decorative hero metrics', 'oversized empty panels'] } },
  { id: 'swiss-brutalist-grid', name: 'Swiss Brutalist Grid', summary: 'Hard alignment, strong ink, and restrained signal red.', tokens: { presetId: 'swiss-brutalist-grid', themePolarity: 'light', colors: { canvas: '#F0EFEA', panel: '#FAF9F5', surface: '#FFFFFF', elevated: '#E3E1DA', primary: '#111111', secondary: '#454545', accent: '#E53920', blueprint: '#1D5D9B' }, typography: { heading: 'Space Grotesk', body: 'Arial', mono: 'IBM Plex Mono', scale: ['10px', '12px', '14px', '20px', '32px'] }, geometry: { borderRadius: [0], borderWidth: 1, gridSize: 20 }, bannedPatterns: ['purple gradients', 'ambient blur blobs', 'soft-shadowed cards', 'decorative rounded containers'] } },
]
