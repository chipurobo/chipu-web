/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        // Dyslexic-friendly fonts
        'dyslexic': ['OpenDyslexic', 'Comic Sans MS', 'Arial', 'Helvetica', 'sans-serif'],
        'sans': ['OpenDyslexic', 'Inter', 'system-ui', 'sans-serif'],
        'accessibility': ['OpenDyslexic', 'Verdana', 'Tahoma', 'sans-serif'],
      },
      colors: {
        chipurobo: {
          green: '#10b981', // ChipuRobo brand emerald green
          warmGreen: '#22c55e', // Warmer sustainability green
          white: '#ffffff', // White
          black: '#000000', // Black
          grey: '#6b7280', // Metallic grey
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
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
};
