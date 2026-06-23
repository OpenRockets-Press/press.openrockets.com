/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink:        'var(--color-ink)',
        cream:      'var(--color-cream)',
        gold:       'var(--color-gold)',
        d1:         'var(--color-d1-primary)',
        d2:         'var(--color-d2-primary)',
        d3:         'var(--color-d3-primary)',
      }
    },
  },
  plugins: [],
}
