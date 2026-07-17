import { getLocales } from "expo-localization";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { resources } from "./resources";

export const DEFAULT_LANGUAGE = "pt-BR";
export const SUPPORTED_LOCALES = ["pt-BR"] as const; // adicione outros idiomas aqui no futuro
export const NAMESPACES = ["common", "auth", "billing", "discover", "groups", "matches", "player", "venue", "zod"] as const;

/** Idioma inicial a partir do device, com fallback no default (pt-BR). */
function resolveInitialLanguage(): string {
  const deviceTag = getLocales()[0]?.languageTag ?? DEFAULT_LANGUAGE;
  const supported = SUPPORTED_LOCALES as readonly string[];
  if (supported.includes(deviceTag)) return deviceTag;
  const base = deviceTag.split("-")[0];
  return supported.find((l) => l.startsWith(base)) ?? DEFAULT_LANGUAGE;
}

export async function initI18n() {
  if (i18n.isInitialized) return i18n;

  // eslint-disable-next-line import/no-named-as-default-member -- uso idiomático do i18next (i18n.use)
  await i18n.use(initReactI18next).init({
    resources,
    lng: resolveInitialLanguage(),
    fallbackLng: DEFAULT_LANGUAGE,
    supportedLngs: SUPPORTED_LOCALES as unknown as string[],
    ns: NAMESPACES,
    defaultNS: "common",
    interpolation: { escapeValue: false },
    returnNull: false,
  });

  return i18n;
}

export { default as i18n } from "i18next";
