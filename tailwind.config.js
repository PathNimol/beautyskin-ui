/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    container: {
      center: true,
      padding: '1rem',
    },
    extend: {
      colors: {
        background: { DEFAULT: 'var(--background)' },
        foreground: { DEFAULT: 'var(--foreground)' },
        primary: {
          DEFAULT: 'var(--primary)',
          foreground: 'var(--primary-foreground)',
        },
        secondary: {
          DEFAULT: 'var(--secondary)',
          foreground: 'var(--secondary-foreground)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          foreground: 'var(--accent-foreground)',
        },
        muted: {
          DEFAULT: 'var(--muted)',
          foreground: 'var(--muted-foreground)',
        },
        card: {
          DEFAULT: 'var(--card)',
          foreground: 'var(--card-foreground)',
        },
        border: { DEFAULT: 'var(--border)' },
        input: { DEFAULT: 'var(--input)' },
        ring: { DEFAULT: 'var(--ring)' },
        'rose-deep': { DEFAULT: 'var(--rose-deep)' },
        'rose-light': { DEFAULT: 'var(--rose-light)' },
        'gold-deep': { DEFAULT: 'var(--gold-deep)' },
        'cream-deep': { DEFAULT: 'var(--cream-deep)' },
        'admin-bg': { DEFAULT: 'var(--admin-bg)' },
        'admin-sidebar': { DEFAULT: 'var(--admin-sidebar)' },
      },
      borderRadius: {
        DEFAULT: 'var(--radius)',
        sm: 'calc(var(--radius) * 0.5)',
        md: 'calc(var(--radius) * 0.75)',
        lg: 'var(--radius)',
        xl: 'calc(var(--radius) * 1.5)',
        '2xl': 'calc(var(--radius) * 2)',
        '3xl': 'calc(var(--radius) * 3)',
      },
      fontFamily: {
        sans: ['var(--font-plus-jakarta-sans)', 'Plus Jakarta Sans', 'sans-serif'],
        display: ['var(--font-plus-jakarta-sans)', 'Plus Jakarta Sans', 'sans-serif'],
      },
      boxShadow: {
        rose: '0 8px 32px rgba(232, 180, 184, 0.25)',
        gold: '0 8px 32px rgba(212, 163, 115, 0.22)',
        soft: '0 4px 24px rgba(43, 43, 43, 0.08)',
        card: '0 2px 16px rgba(43, 43, 43, 0.06), 0 1px 4px rgba(43, 43, 43, 0.04)',
      },
      animation: {
        'float': 'float-gentle 4s ease-in-out infinite',
        'gradient-shift': 'gradientShift 6s ease infinite',
      },
      plugins: [require('@tailwindcss/typography')],
    },
  },
  plugins: [require('@tailwindcss/typography')],
};