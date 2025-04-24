/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        chipurobo: {
          green: '#22c55e', // Primary green
          white: '#ffffff', // White
          black: '#000000', // Black
          paleNavy: '#5f6a8a', // Pale navy blue
          grey: '#d1d5db', // Grey
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
};