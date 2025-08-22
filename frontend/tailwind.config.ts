import type { Config } from "tailwindcss"

export default <Partial<Config>>{
  content: ["./index.html", "./src/**/*.{ts,tsx,jsx,js}"],
  darkMode: 'class', // 👈 Important
  theme: {
    extend: {
      colors: {
        dark: "#0d0d0d",
        light: "#ffffff",
        card: "#1a1a1a",
        muted: "#999999",
        accent: "#8b5cf6",
      },
      borderRadius: {
        xl: "1rem",
      },
      boxShadow: {
        soft: "0 4px 20px rgba(0, 0, 0, 0.3)",
      },
    },
  },
  plugins: [],
};
