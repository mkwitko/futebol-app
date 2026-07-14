/**
 * Tokens de design — "Estádio à Noite".
 *
 * Fonte da verdade para os valores brutos (hex). O `tailwind.config.js` espelha
 * estes mesmos valores em `theme.extend.colors`/`theme.extend.fontFamily` para uso
 * via `className` (NativeWind). Use este módulo quando precisar do valor bruto
 * fora do NativeWind (ex.: `StatusBar`, ícones nativos, gráficos).
 *
 * O app é dark-first e hoje só envia o tema escuro.
 */
export const colors = {
  bg: "#0B140F",
  surface: "#13221A",
  surfaceUp: "#1B2E23",
  primary: "#21C776",
  primaryPress: "#17A05E",
  ink: "#EEF2EE",
  muted: "#8A9A90",
  line: "#24382C",
  danger: "#FF5A47",
  tier: {
    bronze: "#CD7F32",
    prata: "#C7CDD1",
    ouro: "#F0B429",
  },
} as const;

export const fonts = {
  display: "SairaCondensed_600SemiBold",
  displayBold: "SairaCondensed_700Bold",
  body: "HankenGrotesk_400Regular",
  bodyMedium: "HankenGrotesk_500Medium",
  bodySemiBold: "HankenGrotesk_600SemiBold",
} as const;

export const theme = {
  colors,
  fonts,
} as const;

export type Theme = typeof theme;
