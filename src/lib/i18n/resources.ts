import authPt from "./locales/pt-BR/auth.json";
import billingPt from "./locales/pt-BR/billing.json";
import commonPt from "./locales/pt-BR/common.json";
import discoverPt from "./locales/pt-BR/discover.json";
import groupsPt from "./locales/pt-BR/groups.json";
import matchesPt from "./locales/pt-BR/matches.json";
import playerPt from "./locales/pt-BR/player.json";
import zodPt from "./locales/pt-BR/zod.json";

export const resources = {
  "pt-BR": {
    common: commonPt,
    auth: authPt,
    billing: billingPt,
    discover: discoverPt,
    groups: groupsPt,
    matches: matchesPt,
    player: playerPt,
    zod: zodPt,
  },
} as const;
