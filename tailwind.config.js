const colors = require("./theme/colors");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx}", "./components/**/*.{js,jsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors,
      boxShadow: {
        gold: "0 0 20px rgba(212, 175, 55, 0.3)",
        "gold-lg": "0 0 40px rgba(212, 175, 55, 0.4)",
        purple: "0 0 20px rgba(155, 89, 182, 0.3)"
      }
    }
  },
  plugins: []
};
