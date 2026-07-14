import {
  HankenGrotesk_400Regular,
  HankenGrotesk_500Medium,
  HankenGrotesk_600SemiBold,
} from "@expo-google-fonts/hanken-grotesk";
import {
  SairaCondensed_600SemiBold,
  SairaCondensed_700Bold,
} from "@expo-google-fonts/saira-condensed";
import { useFonts } from "expo-font";

/**
 * Carrega as fontes da marca ("Estádio à Noite"): Saira Condensed (display) +
 * Hanken Grotesk (body). Retorna `true` quando prontas para uso — segure a
 * splash screen até então (ver `src/app/_layout.tsx`).
 */
export function useAppFonts(): boolean {
  const [loaded] = useFonts({
    SairaCondensed_600SemiBold,
    SairaCondensed_700Bold,
    HankenGrotesk_400Regular,
    HankenGrotesk_500Medium,
    HankenGrotesk_600SemiBold,
  });

  return loaded;
}
