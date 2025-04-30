/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "custom-blue": "#4C6EF5",
        "custom-green": "#28A745",
        "custom-red": "#DC3545",
        "custom-yellow": "#FFC107",
      },
    },
  },
  plugins: [],
};
