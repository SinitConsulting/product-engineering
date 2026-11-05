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
        // Paleta Semáforo Oficial (skills_marca)
        semaforo: {
          red: {
            DEFAULT: "#E53E3E", // 🔴 Rojo Urgente (<48h)
            hover: "#C53030",
            light: "#FED7D7",
            dark: "#9B2C2C",
          },
          yellow: {
            DEFAULT: "#D69E2E", // 🟡 Amarillo Precaución (3-7d)
            hover: "#B7791F",
            light: "#FEFCBF",
            dark: "#744210",
          },
          green: {
            DEFAULT: "#38A169", // 🟢 Verde Seguro (>7d / No perecedero)
            hover: "#2F855A",
            light: "#C6F6D5",
            dark: "#22543D",
          },
        },
      },
      fontFamily: {
        sans: ["system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;

