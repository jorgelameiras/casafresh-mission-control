import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#060A14',
        card: '#0C1120',
        'card-border': '#1A2035',
        accent: '#63D866',
        'agent-jarvis': '#63D866',
        'agent-codebot': '#3A7BC8',
        'agent-reviewbot': '#B49A60',
        'agent-bizbot': '#9AED9C',
        'neon-cyan': '#00D9FF',
        'neon-purple': '#A855F7',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Menlo', 'monospace'],
      },
      animation: {
        pulse_slow: 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
}
export default config
