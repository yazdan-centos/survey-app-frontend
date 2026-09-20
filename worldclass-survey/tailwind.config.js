/** @type {import('tailwindcss').Config} */
import { PRIMARY, CHARCOAL } from './src/theme/colors.js';

export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Vazirmatn', 'Tahoma', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: PRIMARY,
        charcoal: CHARCOAL,
      },
    },
  },
  plugins: [],
};
