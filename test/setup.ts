import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import auth from "../src/lib/i18n/locales/pt-BR/auth.json";
import common from "../src/lib/i18n/locales/pt-BR/common.json";
import groups from "../src/lib/i18n/locales/pt-BR/groups.json";
import matches from "../src/lib/i18n/locales/pt-BR/matches.json";
import zod from "../src/lib/i18n/locales/pt-BR/zod.json";
import { server } from "./mocks/server";

// Mock manual (raiz `__mocks__/react-native-reanimated.js`) aplicado automaticamente pelo Jest.

// i18n REAL e síncrono com os recursos pt-BR embutidos — asserts veem o texto
// traduzido de verdade, sem HTTP backend.
if (!i18n.isInitialized) {
  // eslint-disable-next-line import/no-named-as-default-member -- uso idiomático do i18next (i18n.use)
  void i18n.use(initReactI18next).init({
    lng: "pt-BR",
    fallbackLng: "pt-BR",
    ns: ["common", "auth", "groups", "matches", "zod"],
    defaultNS: "common",
    resources: { "pt-BR": { common, auth, groups, matches, zod } },
    interpolation: { escapeValue: false },
    returnNull: false,
  });
}

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
