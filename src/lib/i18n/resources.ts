import authPt from "./locales/pt-BR/auth.json";
import billingPt from "./locales/pt-BR/billing.json";
import bookingPt from "./locales/pt-BR/booking.json";
import commonPt from "./locales/pt-BR/common.json";
import courtPt from "./locales/pt-BR/court.json";
import discoverPt from "./locales/pt-BR/discover.json";
import groupsPt from "./locales/pt-BR/groups.json";
import matchesPt from "./locales/pt-BR/matches.json";
import playerPt from "./locales/pt-BR/player.json";
import venuePt from "./locales/pt-BR/venue.json";
import zodPt from "./locales/pt-BR/zod.json";

export const resources = {
  "pt-BR": {
    common: commonPt,
    auth: authPt,
    billing: billingPt,
    booking: bookingPt,
    court: courtPt,
    discover: discoverPt,
    groups: groupsPt,
    matches: matchesPt,
    player: playerPt,
    venue: venuePt,
    zod: zodPt,
  },
} as const;
