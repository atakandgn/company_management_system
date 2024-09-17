/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: "#4B49AC",
        secondary: "#98BDFF",
        supporting: {
          1: "#f5f7ff",
          2: "#F3F4F6",
          3: "#E5E7EB",
          4: "#D1D5DB",
          5: "#9CA3AF",
        },
        text: {
          1: "#111827",
          2: "#6B7280",
          3: "#4B5563",
          4: "#9CA3AF",
          5: "#F9FAFB",
        },
        gray_color: "#f6f6f6 ",
      },
    },
  },
  plugins: [],
};
