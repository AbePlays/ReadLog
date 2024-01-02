import type { Config } from 'tailwindcss'

export default {
  content: ['./app/**/*.{ts,tsx}'],
  theme: {
    extend: {
      height: {
        base: '2.5rem'
      }
    }
  },
  plugins: [require('@tailwindcss/typography')]
} satisfies Config
