/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{ts,tsx}"],
  presets: [require("nativewind/preset")],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // "Estádio à Noite" — verde-gramado à noite, dark-first.
        bg: "#0B140F",
        surface: "#13221A",
        "surface-up": "#1B2E23",
        primary: {
          DEFAULT: "#21C776",
          press: "#17A05E",
        },
        ink: "#EEF2EE",
        muted: "#8A9A90",
        line: "#24382C",
        danger: "#FF5A47",
        tier: {
          bronze: "#CD7F32",
          prata: "#C7CDD1",
          ouro: "#F0B429",
        },
      },
      fontFamily: {
        // Saira Condensed — placares, overalls, headings, "número de camisa".
        display: ["SairaCondensed_600SemiBold", "System"],
        "display-bold": ["SairaCondensed_700Bold", "System"],
        // Hanken Grotesk — todo o resto.
        body: ["HankenGrotesk_400Regular", "System"],
        "body-medium": ["HankenGrotesk_500Medium", "System"],
        "body-semibold": ["HankenGrotesk_600SemiBold", "System"],
      },
    },
  },
  plugins: [],
};
