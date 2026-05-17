// tailwind.config.js
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          text: "#8C8D8F",
          white: "#FEFFFF",
          neutral: "#303530",
          bg: "#191A1F",
          bgSurface: "#1E212A",
          primary: "#00B764",
          deepPrimary: "#152826",
        },
        clan: {
          gold: "#FFD700",
          blue: "#4682B4",
          beige: "#E5D3B3",
        },
      },
    },
  },
  plugins: [],
}