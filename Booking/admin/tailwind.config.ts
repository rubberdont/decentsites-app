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
        // Admin primary colors
        "admin-primary": "#6366f1",
        "admin-primary-hover": "#4f46e5",
        "admin-primary-light": "#818cf8",
        
        // Admin background colors
        "admin-bg": "#0f172a",
        "admin-bg-card": "#1e293b",
        "admin-bg-hover": "#334155",
        "admin-bg-input": "#1e293b",
        
        // Admin text colors
        "admin-text": "#f1f5f9",
        "admin-text-muted": "#94a3b8",
        "admin-text-dark": "#64748b",
        
        // Admin border colors
        "admin-border": "#334155",
        "admin-border-light": "#475569",
        
        // Status colors
        "status-confirmed": "#22c55e",
        "status-confirmed-bg": "rgba(34, 197, 94, 0.1)",
        "status-pending": "#f59e0b",
        "status-pending-bg": "rgba(245, 158, 11, 0.1)",
        "status-cancelled": "#ef4444",
        "status-cancelled-bg": "rgba(239, 68, 68, 0.1)",
        "status-rejected": "#dc2626",
        "status-rejected-bg": "rgba(220, 38, 38, 0.1)",
        "status-completed": "#3b82f6",
        "status-completed-bg": "rgba(59, 130, 246, 0.1)",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        "admin-card": "0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -2px rgba(0, 0, 0, 0.2)",
        "admin-dropdown": "0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -4px rgba(0, 0, 0, 0.3)",
      },
      animation: {
        "fade-in": "fadeIn 0.2s ease-in-out",
        "slide-in": "slideIn 0.3s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideIn: {
          "0%": { transform: "translateY(-10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
