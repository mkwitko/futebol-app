import "../../global.css";
// Registra o background message handler no load (fora do ciclo de componente),
// como o RNFirebase exige. No-op quando push está desligado.
import "@/lib/push/background";

import { useEffect, useState } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { Stack } from "expo-router";
import { I18nextProvider } from "react-i18next";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { BrandedLoading } from "@/components/ui/branded-loading";
import { useGetMyPlayer } from "@/api/generated/hooks/playersHooks";
import { queryClient } from "@/api/query-client";
import { AuthProvider, useAuth } from "@/hooks/auth/use-auth";
import { useAppFonts } from "@/lib/fonts/use-app-fonts";
import { i18n, initI18n } from "@/lib/i18n";

void SplashScreen.preventAutoHideAsync();

function RootNavigator() {
  const { isAuthenticated, isLoading } = useAuth();

  // Resolve o próprio jogador pra decidir o gate de onboarding. Só busca
  // autenticado; `findOrCreateForUser` no backend garante que a linha existe.
  const playerQuery = useGetMyPlayer({ query: { enabled: isAuthenticated } });

  // Segura a UI (splash estendida, não tela cinza) enquanto a sessão (tokens no
  // secure store + GET /auth/me) ainda está sendo resolvida.
  if (isLoading) return <BrandedLoading />;
  // Já autenticado mas o jogador ainda carregando: segura pra não piscar o app
  // antes de decidir se manda pro onboarding. `isLoading` (não `isPending`) só
  // é true durante o primeiro fetch em andamento — em erro/timeout resolve e
  // cai pro app (nunca fica em loading infinito se a API não responder).
  if (isAuthenticated && playerQuery.isLoading) return <BrandedLoading />;

  // Perfil "definido" = tem ao menos uma posição declarada (afinidade não-vazia).
  // Em erro de carga (`data` undefined), não força onboarding — o app cuida do retry.
  const affinity = playerQuery.data?.affinity ?? {};
  const needsOnboarding = isAuthenticated && playerQuery.data !== undefined && Object.keys(affinity).length === 0;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/*
        Landing de `/j/:slug` (universal/app link — Fase 3 share-carta):
        fora de qualquer `Stack.Protected` de propósito, pra abrir com o
        visitante deslogado (`getPublicProfile` não exige sessão) e sem
        depender do gate de onboarding.
      */}
      <Stack.Screen name="j/[slug]" options={{ headerShown: false }} />
      <Stack.Protected guard={isAuthenticated && !needsOnboarding}>
        <Stack.Screen name="(drawer)" />
        <Stack.Screen name="group/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="group/[id]/create-match" options={{ headerShown: false }} />
        <Stack.Screen name="match/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="player/[playerId]" options={{ headerShown: false }} />
        <Stack.Screen name="billing/return" options={{ headerShown: false }} />
      </Stack.Protected>
      <Stack.Protected guard={needsOnboarding}>
        <Stack.Screen name="onboarding" />
      </Stack.Protected>
      <Stack.Protected guard={!isAuthenticated}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  const fontsLoaded = useAppFonts();
  const [i18nReady, setI18nReady] = useState(false);

  useEffect(() => {
    void initI18n().then(() => setI18nReady(true));
  }, []);

  const ready = fontsLoaded && i18nReady;

  useEffect(() => {
    if (ready) void SplashScreen.hideAsync();
  }, [ready]);

  if (!ready) return <BrandedLoading />;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <KeyboardProvider>
        <I18nextProvider i18n={i18n}>
          <QueryClientProvider client={queryClient}>
            <AuthProvider>
              <StatusBar style="light" />
              <RootNavigator />
            </AuthProvider>
          </QueryClientProvider>
        </I18nextProvider>
      </KeyboardProvider>
    </GestureHandlerRootView>
  );
}
