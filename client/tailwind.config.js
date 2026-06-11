/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#18211d",
        clay: "#9a5334",
        leaf: "#376954",
        marigold: "#d99b2b",
        linen: "#fbf8f1"
      },
      boxShadow: {
        soft: "0 12px 34px rgba(24, 33, 29, 0.10)"
      }
    }
  },
  plugins: []
};
