/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'inter': ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial'],
        'noto-thai': ['Noto Sans Thai', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial'],
      },
      colors: {
        'ciy-blue': '#173BA6',
        'ciy-yellow': '#FFD200',
        'ciy-dark': '#0A0F2C',
      },
      animation: {
        'slide-in': 'slideIn 0.4s ease',
      },
      keyframes: {
        slideIn: {
          from: { transform: 'translateY(8px)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}