/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './src/pages/**/*.{ts,tsx}',
    './src/components/**/*.{ts,tsx}',
    './src/app/**/*.{ts,tsx}',
    '../../packages/shared/src/**/*.{ts,tsx}'
  ],
  theme: {
    container: {
      center: true,
      padding: "1.5rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        primary: {
          DEFAULT: "#16A36A",
          hover: "#138656",
          light: "#E8F8F0",
          foreground: "#FFFFFF",
        },
        secondary: {
          DEFAULT: "#0F766E",
          hover: "#0D655E",
          light: "#E6F5F4",
          foreground: "#FFFFFF",
        },
        accent: {
          DEFAULT: "#10B981",
          foreground: "#FFFFFF",
        },
        background: "#F8FAFC",
        surface: "#FFFFFF",
        brandText: {
          primary: "#172B24",
          secondary: "#64748B",
          muted: "#94A3B8",
        },
        status: {
          success: "#16A36A",
          warning: "#E9A23B",
          error: "#DC5252",
          info: "#0284C7",
          neutral: "#64748B"
        },
        border: "#E2E8F0",
      },
      borderRadius: {
        lg: "16px",
        md: "12px",
        sm: "8px",
      },
      fontFamily: {
        sans: ["Inter", "Geist", "system-ui", "-apple-system", "sans-serif"],
      },
      boxShadow: {
        subtle: "0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)",
        card: "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05)",
        float: "0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04)",
      }
    },
  },
  plugins: [],
}
