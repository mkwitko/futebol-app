import type { ConfigContext, ExpoConfig } from "expo/config";

// Base URL da API: EXPO_PUBLIC_API_URL (env) tem prioridade; senão cai no default local.
// Ver src/env.ts para o consumo validado (Zod) desse valor.
const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3333";
// Base URL do site (página pública do convidado) — usada para montar o link
// de convite compartilhado no zap (`/invite/<token>`).
const WEB_URL = process.env.EXPO_PUBLIC_WEB_URL ?? "http://localhost:5173";

// Google Sign-In (real, config-gated — ver .env.example para o passo a passo
// completo). Sem `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID`, o config plugin do
// `@react-native-google-signin/google-signin` é omitido: sem ele, o plugin
// tentaria ler um `GoogleService-Info.plist` do Firebase (que este projeto
// não usa) e quebraria o `expo prebuild`. O app funciona normalmente sem
// essas envs — o botão de Google só fica desabilitado ("em breve").
const GOOGLE_IOS_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID ?? "";

/**
 * Deriva o "reversed client ID" (URL scheme do iOS) a partir do client ID
 * OAuth do iOS — formato `<algo>.apps.googleusercontent.com` vira
 * `com.googleusercontent.apps.<algo>`. É esse scheme que o config plugin
 * registra no `Info.plist` pra receber o callback do fluxo nativo.
 */
function iosUrlSchemeFrom(iosClientId: string): string | null {
  const suffix = ".apps.googleusercontent.com";
  if (!iosClientId.endsWith(suffix)) return null;
  return `com.googleusercontent.apps.${iosClientId.slice(0, -suffix.length)}`;
}

const googleIosUrlScheme = GOOGLE_IOS_CLIENT_ID ? iosUrlSchemeFrom(GOOGLE_IOS_CLIENT_ID) : null;

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "futebol-app",
  slug: "futebol-app",
  scheme: "futebolapp",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/icon.png",
  userInterfaceStyle: "dark",
  ios: {
    supportsTablet: true,
    userInterfaceStyle: "dark",
  },
  android: {
    adaptiveIcon: {
      backgroundColor: "#0B140F",
      foregroundImage: "./assets/android-icon-foreground.png",
      backgroundImage: "./assets/android-icon-background.png",
      monochromeImage: "./assets/android-icon-monochrome.png",
    },
    userInterfaceStyle: "dark",
    predictiveBackGestureEnabled: false,
  },
  web: {
    favicon: "./assets/favicon.png",
    bundler: "metro",
  },
  plugins: [
    "expo-router",
    "expo-secure-store",
    "expo-font",
    "expo-localization",
    "expo-image",
    "@react-native-community/datetimepicker",
    [
      "expo-splash-screen",
      {
        backgroundColor: "#0B140F",
        image: "./assets/splash-icon.png",
        imageWidth: 200,
      },
    ],
    ...(googleIosUrlScheme
      ? [["@react-native-google-signin/google-signin", { iosUrlScheme: googleIosUrlScheme }] as [string, unknown]]
      : []),
  ],
  experiments: {
    typedRoutes: true,
  },
  extra: {
    apiUrl: API_URL,
    webUrl: WEB_URL,
    googleWebClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ?? "",
    googleIosClientId: GOOGLE_IOS_CLIENT_ID,
  },
});
