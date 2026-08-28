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
        cyber: {
          dark: "#030712",      // deep charcoal space
          card: "rgba(11, 21, 40, 0.5)", // translucent slate
          border: "rgba(255, 255, 255, 0.08)", // glass border
          glow: "#6366f1",      // indigo core
          neonCyan: "#06b6d4",  // bright cyan alert
          neonViolet: "#8b5cf6",// purple laser
          neonRose: "#f43f5e",  // red threat warning
          neonGreen: "#10b981"  // emerald success
        }
      },
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
        display: ["var(--font-outfit)", "sans-serif"],
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "glow-slow": "glow 8s ease-in-out infinite",
        "glowing-border": "glowBorder 4s linear infinite",
      },
      keyframes: {
        glow: {
          "0%, 100%": { transform: "scale(1)", filter: "blur(40px)", opacity: "0.4" },
          "50%": { transform: "scale(1.2)", filter: "blur(60px)", opacity: "0.65" },
        },
        glowBorder: {
          "0%, 100%": { "border-color": "rgba(99, 102, 241, 0.4)" },
          "50%": { "border-color": "rgba(6, 182, 212, 0.8)" },
        }
      },
      boxShadow: {
        "neon-cyan": "0 0 15px rgba(6, 182, 212, 0.5)",
        "neon-purple": "0 0 15px rgba(139, 92, 246, 0.5)",
        "neon-rose": "0 0 15px rgba(244, 63, 94, 0.5)",
        "glass-inset": "inset 0 1px 1px rgba(255, 255, 255, 0.1)",
      }
    },
  },
  plugins: [],
};

export default config;
