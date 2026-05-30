import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        gdg: {
          blue: "#4285F4",
          red: "#EA4335",
          yellow: "#FBBC04",
          green: "#34A853",
          dark: "#0A0A0F",
          surface: "#12121A",
          card: "#1A1A26",
          border: "#2A2A3E",
        },
      },
      fontFamily: {
        display: ["'Exo 2'", "sans-serif"],
        body: ["'DM Sans'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      animation: {
        "pulse-blue": "pulseBlue 2s ease-in-out infinite",
        "glow-rotate": "glowRotate 4s linear infinite",
        "float": "float 3s ease-in-out infinite",
        "slide-up": "slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "countdown": "countdown 1s ease-in-out",
        "shimmer": "shimmer 2s linear infinite",
      },
      keyframes: {
        pulseBlue: {
          "0%, 100%": { boxShadow: "0 0 20px rgba(66, 133, 244, 0.3)" },
          "50%": { boxShadow: "0 0 40px rgba(66, 133, 244, 0.7)" },
        },
        glowRotate: {
          "0%": { filter: "hue-rotate(0deg)" },
          "100%": { filter: "hue-rotate(360deg)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },
        slideUp: {
          from: { opacity: "0", transform: "translateY(30px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        countdown: {
          "0%": { transform: "scale(0.3)", opacity: "0" },
          "50%": { transform: "scale(1.2)", opacity: "1" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      backgroundImage: {
        "gdg-gradient": "linear-gradient(135deg, #4285F4, #34A853, #FBBC04, #EA4335)",
        "dark-grid": "linear-gradient(rgba(66,133,244,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(66,133,244,0.05) 1px, transparent 1px)",
      },
    },
  },
  plugins: [],
};

export default config;
