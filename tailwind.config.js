/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        move: "move 5s linear infinite",
      },
      fontFamily: {
        bebas: ['Bebas Neue', 'sans-serif'],
      },
      boxShadow: {
        'glow-dorange': '0 0 10px #d03902, 0 0 20px #d03902, 0 0 30px #d03902',
      },
      keyframes: {
        glowingBorder: {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        move: {
          "0%": { transform: "translateX(-200px)" },
          "100%": { transform: "translateX(200px)" },
        },
      },
      animation: {
        'glow-border': 'glowingBorder 3s linear infinite',
      },

    },
  },
  plugins: [
   require('tw-animate-css')
  ],
};
