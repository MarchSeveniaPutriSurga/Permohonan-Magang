/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "custom-khaki": "#A0937D",
        "khaki-1": "#DDD5C7",
        "soft-choco-1": "#E8DDDA",
        "soft-choco-2": "#fff6f4",
        "custom-choco-1": "#9b8983",
        "custom-choco-2": "#685752",
        "custom-choco-3": "#493628",
        "olive-1": "#698269",
        "custom-green-1": "#EBF5EC",
      },
    },
  },
  plugins: [],
};
