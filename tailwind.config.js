/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  // Theme switching has been removed — site is single-theme (cream/warm).
  // Setting darkMode to a non-existent selector ensures any stray `dark:`
  // utilities never activate via the system colour-scheme preference.
  darkMode: ['class', '.dark-mode-disabled-no-such-class'],
  theme: {
    extend: {
      fontFamily: {
        // Default body — OpenDyslexic for accessibility + character
        'sans': ['OpenDyslexic', '"Comic Sans MS"', 'system-ui', 'sans-serif'],
        'dyslexic': ['OpenDyslexic', '"Comic Sans MS"', 'Arial', 'Helvetica', 'sans-serif'],
        // Robotic / pixel headings & display
        'pixel': ['"Press Start 2P"', 'monospace', 'system-ui'],
        'display': ['"Press Start 2P"', '"DM Serif Display"', 'Georgia', 'serif'],
        // Explicit terminal/code use only — opt-in via `font-mono`
        'mono': ['VT323', '"Share Tech Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
        'mono-clean': ['"Share Tech Mono"', 'VT323', 'ui-monospace', 'monospace'],
        // Legacy escape hatches
        'inter': ['Inter', 'system-ui', 'sans-serif'],
        'accessibility': ['OpenDyslexic', 'Verdana', 'Tahoma', 'sans-serif'],
      },
      colors: {
        cream: {
          50: '#fefdfb',
          100: '#fdf8f0',
          200: '#f7f0e4',
          300: '#f0e6d3',
          400: '#e8d9c0',
          500: '#d4c4a8',
        },
        warm: {
          50: '#faf8f5',
          100: '#f5f0e8',
          200: '#ede5d8',
          300: '#ddd2bf',
          400: '#c9b99d',
        },
        teal: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
        },
        terracotta: {
          50: '#fef3ee',
          100: '#fce4d6',
          200: '#f9c6ab',
          300: '#f5a076',
          400: '#f07a4a',
          500: '#e85d2a',
          600: '#d44820',
          700: '#b0361c',
          800: '#8d2e1e',
          900: '#72291c',
        },
        chipurobo: {
          green: '#10b981',
          warmGreen: '#22c55e',
          white: '#ffffff',
          black: '#000000',
          grey: '#6b7280',
        },
        primary: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
          950: '#022c22',
        },
      },
      boxShadow: {
        'soft-sm': '0 2px 8px rgba(0, 0, 0, 0.04)',
        'soft-md': '0 4px 16px rgba(0, 0, 0, 0.06)',
        'soft-lg': '0 8px 30px rgba(0, 0, 0, 0.08)',
        'soft-xl': '0 16px 50px rgba(0, 0, 0, 0.10)',
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
        scroll: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.6s ease-out',
        'slide-in': 'slideIn 0.4s ease-out',
        'scroll': 'scroll 25s linear infinite',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
};
