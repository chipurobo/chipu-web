/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
        'dyslexic': ['OpenDyslexic', 'Comic Sans MS', 'Arial', 'Helvetica', 'sans-serif'],
        'accessibility': ['OpenDyslexic', 'Verdana', 'Tahoma', 'sans-serif'],
      },
      colors: {
        chipurobo: {
          green: '#10b981',
          warmGreen: '#22c55e',
          white: '#ffffff',
          black: '#000000',
          grey: '#6b7280',
        },
        primary: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
          950: '#431407',
        },
      },
      boxShadow: {
        'soft-sm': '0 2px 8px rgba(0, 0, 0, 0.06)',
        'soft-md': '0 4px 16px rgba(0, 0, 0, 0.08)',
        'soft-lg': '0 8px 30px rgba(0, 0, 0, 0.10)',
        'soft-xl': '0 16px 50px rgba(0, 0, 0, 0.14)',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%': { opacity: '0', transform: 'translateX(-10px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.6s ease-out',
        'slide-in': 'slideIn 0.4s ease-out',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
};
