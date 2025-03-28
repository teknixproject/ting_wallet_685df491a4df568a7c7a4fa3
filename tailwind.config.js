/** @type {import('tailwindcss').Config} */
import { tailwindConfigSafeList } from './configTailwind';
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  safeList: [...tailwindConfigSafeList],
  theme: {
    extend: {},
  },
  plugins: [],
};
