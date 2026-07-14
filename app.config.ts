import type { ConfigContext, ExpoConfig } from "expo/config";

// Base URL da API: EXPO_PUBLIC_API_URL (env) tem prioridade; senão cai no default local.
// Ver src/env.ts para o consumo validado (Zod) desse valor.
const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3333";

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
    [
      "expo-splash-screen",
      {
        backgroundColor: "#0B140F",
        image: "./assets/splash-icon.png",
        imageWidth: 200,
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
  },
  extra: {
    apiUrl: API_URL,
  },
});
