import authPt from "./locales/pt-BR/auth.json";
import commonPt from "./locales/pt-BR/common.json";
import zodPt from "./locales/pt-BR/zod.json";

export const resources = {
  "pt-BR": {
    common: commonPt,
    auth: authPt,
    zod: zodPt,
  },
} as const;
