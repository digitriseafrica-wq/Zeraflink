import type { Config } from 'tailwindcss'

export default {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        maroon: '#76232E',
        sky: '#AFD3F0',
        espresso: '#211815',
        olive: '#44573E',
        offwhite: '#FAF5EF',
      },
      borderRadius: {
        sm: '4px',
        md: '6px',
      }
    },
  },
  plugins: [],
} satisfies Config
