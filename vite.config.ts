import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite';
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const projectRoot = path.dirname(fileURLToPath(import.meta.url))

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    {
      name: 'remove-react-compiler-runtime-directive',
      enforce: 'pre',
      transform(code, id) {
        if (!id.includes('react-compiler-runtime') || !id.endsWith('/dist/index.js')) return null
        return { code: code.replace(/^"use no memo";\s*/m, ''), map: null }
      },
    },
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(projectRoot, 'src'),
    },
  },
  build: {
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            { name: 'xyflow', test: /node_modules[\\/]@xyflow[\\/]/, priority: 20 },
            { name: 'shiki', test: /node_modules[\\/](@shikijs|shiki)[\\/]/, priority: 20 },
            { name: 'vendor', test: /node_modules[\\/]/, priority: 10, minSize: 20_000, maxSize: 400_000 },
          ],
        },
      },
    },
  },
})
