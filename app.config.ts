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

// Push (FCM via @react-native-firebase) — OPCIONAL e config-gated, igual ao
// Google Sign-In. Só com EXPO_PUBLIC_PUSH_ENABLED=true os plugins do Firebase
// entram (e apontam pros arquivos nativos do Firebase). Sem isso, o prebuild
// não tentaria ler `google-services.json`/`GoogleService-Info.plist`
// (ausentes) e quebrar. Ver .env.example.
const PUSH_ENABLED = process.env.EXPO_PUBLIC_PUSH_ENABLED === "true";
const ANDROID_GOOGLE_SERVICES =
  process.env.EXPO_PUBLIC_ANDROID_GOOGLE_SERVICES ?? "./google-services.json";
const IOS_GOOGLE_SERVICES =
  process.env.EXPO_PUBLIC_IOS_GOOGLE_SERVICES ?? "./GoogleService-Info.plist";

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "Camisa7",
  slug: "Camisa7",
  scheme: "futebolapp",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/icon.png",
  userInterfaceStyle: "dark",
  ios: {
    supportsTablet: true,
    userInterfaceStyle: "dark",
    bundleIdentifier: "com.mauriciooliveira.futebolapp",
    ...(PUSH_ENABLED ? { googleServicesFile: IOS_GOOGLE_SERVICES } : {}),
  },
  android: {
    package: "com.mauriciooliveira.futebolapp",
    adaptiveIcon: {
      backgroundColor: "#0B140F",
      foregroundImage: "./assets/android-icon-foreground.png",
      backgroundImage: "./assets/android-icon-background.png",
      monochromeImage: "./assets/android-icon-monochrome.png",
    },
    userInterfaceStyle: "dark",
    predictiveBackGestureEnabled: false,
    // "resize" já é o default do Expo (`android:windowSoftInputMode="adjustResize"`),
    // mas deixamos explícito: com o edge-to-edge obrigatório (status bar
    // translúcida) do Android 15+/SDK 57, o próprio `@expo/config-plugins`
    // avisa que esse resize automático pode falhar — por isso o
    // `ScreenContainer` (src/components/layout/screen-container.tsx) também
    // dá um `behavior` real ao `KeyboardAvoidingView` no Android, em vez de
    // depender só disso.
    softwareKeyboardLayoutMode: "resize",
    ...(PUSH_ENABLED ? { googleServicesFile: ANDROID_GOOGLE_SERVICES } : {}),
  },
  web: {
    favicon: "./assets/favicon.png",
    bundler: "metro",
  },
  plugins: [
    "expo-router",
    "expo-secure-store",
    "expo-web-browser",
    "expo-font",
    "expo-localization",
    "expo-image",
    "@react-native-community/datetimepicker",
    // Mapa nativo do LocationPicker (criar pelada / cidade do jogador). No
    // Android o Google Maps SDK exige uma chave pra renderizar; lida de env
    // (vazia = mapa em branco no Android, mas o app não quebra). iOS usa Apple
    // Maps (sem chave). Exibir o mapa não é cobrado — o custo é só Places
    // (config-gated em env.ts). Requer `expo prebuild` + build nativo.
    [
      "react-native-maps",
      { androidGoogleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_ANDROID_KEY ?? "" },
    ],
    // Notifee é autolinkado sempre que instalado (independe de push); seu AAR
    // core vem de um maven repo local. Registra esse repo no root build.gradle.
    // Ver plugins/with-notifee-repo.js.
    "./plugins/with-notifee-repo",
    [
      "expo-splash-screen",
      {
        // Arte de splash full-bleed (retrato 2:3). `cover` escala a imagem pra
        // preencher a tela inteira (iOS + Android < 12). No Android 12+ o SO
        // força um ícone centralizado (limitação da Splash Screen API); o
        // `imageWidth` maior deixa esse ícone o maior possível, e a
        // `BrandedLoading` (JS) cobre a tela inteira logo em seguida.
        backgroundColor: "#0B140F",
        image: "./assets/splash-icon.png",
        imageWidth: 300,
        resizeMode: "cover",
      },
    ],
    ...(googleIosUrlScheme
      ? [["@react-native-google-signin/google-signin", { iosUrlScheme: googleIosUrlScheme }] as [string, unknown]]
      : []),
    // FCM: os plugins do Firebase + frameworks estáticos no iOS (exigência do
    // firebase-ios-sdk). Só entram com push ligado — ver PUSH_ENABLED acima.
    ...(PUSH_ENABLED
      ? ([
          "@react-native-firebase/app",
          "@react-native-firebase/messaging",
          [
            "expo-build-properties",
            {
              ios: {
                useFrameworks: "static",
                forceStaticLinking: ["RNFBApp", "RNFBMessaging"],
              },
            },
          ],
          // Ícone/cor da notificação Android (meta-data FCM) — ver
          // plugins/with-notification-icon.js.
          ["./plugins/with-notification-icon", { color: "#21C776" }],
        ] as (string | [string, unknown])[])
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
    pushEnabled: PUSH_ENABLED ? "true" : "false",
    placesAutocompleteEnabled: process.env.EXPO_PUBLIC_PLACES_AUTOCOMPLETE_ENABLED ?? "false",
    googlePlacesApiKey: process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY ?? "",
  },
});
