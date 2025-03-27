/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  // safelist: [
  //   "bg-red-600", // Thêm class bạn muốn giữ
  //   "col-span-1",
  //   "row-span-1",
  //   "grid-rows-1",
  //   "gap-4",
  //   "justify-start",
  //   "items-start",
  //   "flex",
  //   // Thêm các class khác từ API nếu cần
  // ],
  theme: {
    extend: {},
  },
  plugins: [],
}