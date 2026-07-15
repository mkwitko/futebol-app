import authPt from "./locales/pt-BR/auth.json";
import commonPt from "./locales/pt-BR/common.json";
import groupsPt from "./locales/pt-BR/groups.json";
import matchesPt from "./locales/pt-BR/matches.json";
import playerPt from "./locales/pt-BR/player.json";
import zodPt from "./locales/pt-BR/zod.json";

export const resources = {
  "pt-BR": {
    common: commonPt,
    auth: authPt,
    groups: groupsPt,
    matches: matchesPt,
    player: playerPt,
    zod: zodPt,
  },
} as const;
