import { http, HttpResponse } from "msw";
import { env } from "@/env";

const api = (path: string) => `${env.EXPO_PUBLIC_API_URL}${path}`;

const FAKE_USER = {
  id: "user-1",
  email: "alice@futebol.app",
  name: "Alice",
  roles: ["jogador"] as ("jogador" | "organizador" | "quadra")[],
  hasPassword: true,
  googleSub: null,
  lastCity: null as string | null,
  lastLat: null as number | null,
  lastLng: null as number | null,
  createdAt: "2026-01-01T00:00:00.000Z",
};

export const FAKE_VENUE = {
  id: "venue-1",
  ownerId: "user-1",
  name: "Arena Central",
  latitude: -30.0346,
  longitude: -51.2177,
  address: "Av. Ipiranga, 1000",
  city: "Porto Alegre",
  amenities: ["gramado", "iluminacao", "estacionamento"] as string[],
  phone: "51999999999" as string | null,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

export const FAKE_COURT = {
  id: "court-1",
  venueId: FAKE_VENUE.id,
  name: "Quadra 1",
  modality: "society" as "futsal" | "society" | "campo",
  surface: "grama sintética" as string | null,
  slotMinutes: 60,
  bookingMode: "instant" as "instant" | "request" | "deposit",
  depositPercent: null as number | null,
  active: true,
  priceRules: [] as { weekday: number; startMinute: number; endMinute: number; priceCents: number }[],
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

export const FAKE_AVAILABILITY_SLOT = {
  startMinute: 19 * 60,
  endMinute: 20 * 60,
  priceCents: 8000,
  available: true,
};

export const FAKE_GROUP = {
  id: "group-1",
  name: "Pelada dos Amigos",
  ownerId: "user-1",
  statsMode: "organizador",
  monthlyFeeCents: null as number | null,
  isPublic: false,
  joinPolicy: "open" as "open" | "request",
  createdAt: "2026-01-01T00:00:00.000Z",
  memberCount: 12,
  nextMatch: { id: "match-1", datetime: "2026-07-18T21:00:00.000Z", location: "Quadra do Zico" } as {
    id: string;
    datetime: string;
    location: string;
  } | null,
};

export const FAKE_MEMBER = {
  id: "member-1",
  groupId: "group-1",
  role: "jogador",
  primaryPos: "atacante" as string | null,
  secondaryPos: [] as string[],
  affinity: { campo_atacante: 80 } as Record<string, number>,
  seedOverall: { atacante: 75 } as Record<string, number>,
  billingMode: "avulso" as "mensalista" | "avulso",
  monthlyFeeCentsOverride: null as number | null,
  player: {
    id: "player-1",
    userId: null as string | null,
    name: "Zico",
    phone: null as string | null,
    // Task 1 (backend): mapa de afinidade autodeclarado pelo próprio jogador
    // (`Player.affinity`) — distinto de `affinity`/`seedOverall` acima, que
    // são a nota que o organizador dá ao membro (`GroupMember`).
    affinity: {} as Record<string, number>,
  },
};

export const FAKE_MATCH = {
  id: "match-1",
  groupId: "group-1",
  datetime: "2026-07-18T21:00:00.000Z",
  location: "Quadra do Zico",
  priceCents: 2000,
  slots: 18,
  pixKey: "pelada@pix.com",
  status: "open" as const,
  recurrenceRule: null as { weekly: true; weekday: number; time: string } | null,
  createdAt: "2026-01-01T00:00:00.000Z",
};

export const FAKE_ATTENDANCE = {
  id: "att-1",
  matchId: "match-1",
  status: "confirmed" as const,
  waitlistPos: null as number | null,
  paymentStatus: "pending" as const,
  paidConfirmedById: null as string | null,
  player: { id: "player-1", userId: null as string | null, name: "Zico", phone: null as string | null },
  billingMode: "avulso" as "mensalista" | "avulso",
  monthlyDueStatus: "none" as "paid" | "pending" | "none",
};

export const FAKE_MY_PLAYER = {
  id: "player-me-1",
  slug: "mauricio-9f3a",
  name: FAKE_USER.name,
  phone: null as string | null,
  userId: FAKE_USER.id as string | null,
  affinity: { campo_atacante: 100, campo_meia: 60 } as Record<string, number>,
  attributes: {} as Record<string, number>,
  skills: ["chute_colocado"] as string[],
  dominantFoot: "right" as "left" | "right" | "both" | null,
  weakFoot: 4 as number | null,
  skillMoves: 5 as number | null,
  heightCm: 180 as number | null,
  weightKg: 75 as number | null,
  birthYear: 2000 as number | null,
  preferredTeam: "Barcelona" as string | null,
  nationality: "Brasil" as string | null,
  categoryOverall: { ritmo: 81, finalizacao: 86, passe: 79, drible: 82, defesa: 65, fisico: 88, goleiro: 50 } as Record<string, number>,
  overallByPosition: { campo_atacante: 84, campo_meia: 70 } as Record<string, number>,
  generalOverall: 84,
};

type PlayerLevel = "bronze" | "prata" | "ouro";

export type Career = {
  id: string | null;
  playerId: string;
  overall: Record<string, number>;
  affinity: Record<string, number>;
  level: PlayerLevel;
  matchesPlayed: number;
  wins: number;
  draws: number;
  losses: number;
  goals: number;
  assists: number;
  cleanSheets: number;
  mvpCount: number;
  currentStreak: number;
  bestStreak: number;
  achievements: { key: string; label: string; description: string; icon: string; unlocked: boolean }[];
  updatedAt: string | null;
};

/** Bootstrap default — o corpo zerado que o backend devolve (200, não 404) quando ninguém finalizou uma pelada ainda pro jogador. */
function emptyCareer(playerId: string): Career {
  return {
    id: null,
    playerId,
    overall: {},
    affinity: {},
    level: "bronze",
    matchesPlayed: 0,
    wins: 0,
    draws: 0,
    losses: 0,
    goals: 0,
    assists: 0,
    cleanSheets: 0,
    mvpCount: 0,
    currentStreak: 0,
    bestStreak: 0,
    achievements: [],
    updatedAt: null,
  };
}

/** `GET /players/:playerId/public-profile` (`GetPublicProfile200`) — rota PÚBLICA (sem auth) que resolve id-ou-slug; back a tela `/j/:slug`. */
export type PublicProfile = {
  playerId: string;
  name: string;
  level: PlayerLevel;
  overallByPosition: Record<string, number>;
  bestOverall: number;
  bestPosition: string | null;
  matchesPlayed: number;
  wins: number;
  draws: number;
  losses: number;
  winRate: number;
  goals: number;
  assists: number;
  cleanSheets: number;
  mvpCount: number;
  currentStreak: number;
  bestStreak: number;
  achievements: { key: string; label: string; description: string; icon: string; unlocked: boolean }[];
  reputation: Record<string, number>;
  trophies: { year: number; groupId: string; groupName: string; category: string }[];
};

/** `GET /players/me/upcoming-matches` — item de `GetMyUpcomingMatches200` (ver `src/api/generated/types/GetMyUpcomingMatches.ts`). */
export type UpcomingMatch = {
  id: string;
  groupId: string;
  groupName: string;
  datetime: string;
  location: string;
  priceCents: number;
  slots: number;
  status: "open" | "full" | "closed" | "finished" | "cancelled";
  seriesId: string | null;
  attendanceStatus: "confirmed" | "waitlisted" | null;
};

/**
 * Duas partidas: a primeira (`match-hero-1`) sem presença confirmada
 * (`attendanceStatus: null`) — é ela que vira o hero de "Início" com o CTA
 * "Confirmar presença"; a segunda já confirmada, pra exercitar o badge/list
 * das "Demais partidas".
 */
export const FAKE_UPCOMING_MATCHES: UpcomingMatch[] = [
  {
    id: "match-hero-1",
    groupId: FAKE_GROUP.id,
    groupName: "Racha de Quinta",
    datetime: "2026-07-18T21:00:00.000Z",
    location: "Quadra do Zico",
    priceCents: 2000,
    slots: 18,
    status: "open",
    seriesId: null,
    attendanceStatus: null,
  },
  {
    id: "match-hero-2",
    groupId: FAKE_GROUP.id,
    groupName: "Pelada dos Amigos",
    datetime: "2026-07-25T21:00:00.000Z",
    location: "Ginásio Central",
    priceCents: 1500,
    slots: 14,
    status: "open",
    seriesId: null,
    attendanceStatus: "confirmed",
  },
];

export const FAKE_CAREER: Career = {
  id: "career-1",
  playerId: FAKE_MY_PLAYER.id,
  overall: { campo_atacante: 78, campo_meia: 65 },
  affinity: { campo_atacante: 0.8, campo_meia: 0.4 },
  level: "prata",
  matchesPlayed: 12,
  wins: 7,
  draws: 2,
  losses: 3,
  goals: 9,
  assists: 4,
  cleanSheets: 0,
  mvpCount: 2,
  currentStreak: 3,
  bestStreak: 5,
  achievements: [
    { key: "primeiro_gol", label: "Primeiro gol", description: "Marque seu primeiro gol", icon: "⚽", unlocked: true },
    { key: "goleador_10", label: "Goleador", description: "10 gols na carreira", icon: "🎯", unlocked: false },
  ],
  updatedAt: "2026-07-01T00:00:00.000Z",
};

// `monthlyFeeCents`/`billingMode`/`monthlyFeeCentsOverride` são opcionais no tipo do mock
// (mesmo sendo obrigatórios na API real) para não forçar todo handler/fixture
// pré-existente que cria um `Group`/`Member` a declarar esses campos — quando
// omitidos, o JSON devolvido simplesmente não os inclui, o que é inofensivo
// pros testes que não exercitam mensalidade (ver Task 8, mensalista/avulso).
type Group = Omit<typeof FAKE_GROUP, "monthlyFeeCents"> & { monthlyFeeCents?: number | null };
type Member = Omit<typeof FAKE_MEMBER, "billingMode" | "monthlyFeeCentsOverride"> & {
  billingMode?: "mensalista" | "avulso";
  monthlyFeeCentsOverride?: number | null;
};
type Match = {
  id: string;
  groupId: string;
  datetime: string;
  location: string;
  priceCents: number;
  slots: number;
  pixKey: string | null;
  status: "open" | "full" | "closed" | "finished" | "cancelled";
  recurrenceRule: { weekly: true; weekday: number; time: string } | null;
  createdAt: string;
};
type Attendance = {
  id: string;
  matchId: string;
  status: "confirmed" | "waitlisted" | "cancelled";
  waitlistPos: number | null;
  paymentStatus: "pending" | "paid";
  paidConfirmedById: string | null;
  player: { id: string; userId: string | null; name: string; phone: string | null };
  billingMode?: "mensalista" | "avulso";
  monthlyDueStatus?: "paid" | "pending" | "none";
};
type Due = {
  id: string;
  groupId: string;
  groupMemberId: string;
  competencyMonth: string;
  amountCents: number;
  status: "pending" | "paid";
  paidConfirmedById: string | null;
  provider: "manual" | "stripe";
  externalRef: string | null;
  createdAt: string;
};

type TeamsResult = {
  matchId: string;
  teams: { team: number; overallTotal: number; players: { playerId: string; name: string; overall: number }[] }[];
  generatedAt: string;
};

type VoteCategory = "mvp" | "melhor_goleiro" | "craque" | "fair_play";

type MatchResult = {
  matchId: string;
  scores: { team: number; goals: number }[];
  winnerTeam: number | null;
  recordedById: string;
  recordedAt: string;
};

type MatchStat = {
  id: string;
  matchId: string;
  playerId: string;
  team: number | null;
  goals: number;
  assists: number;
  ownGoals: number;
  cleanSheet: boolean;
  source: "organizador" | "colaborativo";
  createdAt: string;
  updatedAt: string;
};

type Vote = {
  id: string;
  matchId: string;
  voterPlayerId: string;
  category: VoteCategory;
  votedPlayerId: string;
  createdAt: string;
  updatedAt: string;
};

type JoinRequest = {
  id: string;
  matchId: string;
  playerId: string;
  playerName: string;
  createdAt: string;
};

type ReputationDimension = "pontualidade" | "educacao" | "compromisso" | "respeito";

type ReputationTag = {
  votedPlayerId: string;
  dimensions: ReputationDimension[];
};

type GroupReputationMember = {
  playerId: string;
  name: string;
  reputation: Record<ReputationDimension, number>;
};

type Court = typeof FAKE_COURT;
type AvailabilitySlot = typeof FAKE_AVAILABILITY_SLOT;

type BookingModeValue = "instant" | "request" | "deposit";
type BookingStatusValue =
  | "requested"
  | "pending_payment"
  | "confirmed"
  | "completed"
  | "cancelled"
  | "rejected"
  | "expired";

type Booking = {
  id: string;
  courtId: string;
  bookedById: string;
  date: string;
  startMinute: number;
  endMinute: number;
  priceCents: number;
  mode: BookingModeValue;
  status: BookingStatusValue;
  depositCents: number | null;
  stripePaymentIntentId: string | null;
  createdAt: string;
  updatedAt: string;
};

type PixVoucherFixture = { qrCodeImageUrl: string; copyPaste: string; expiresAt: string };

/** Erro simulado de `POST /bookings` — usado pra testar os 409/503 mapeados em `reserve.tsx`. */
type CreateBookingErrorFixture = { status: number; code: string } | null;

type DiscoverMatch = {
  matchId: string;
  groupId: string;
  groupName: string;
  datetime: string;
  location: string;
  address: string | null;
  city: string | null;
  latitude: number;
  longitude: number;
  priceCents: number;
  slots: number;
  confirmedCount: number;
  distanceKm: number;
  modality: "futsal" | "society" | "campo";
  joinPolicy: "open" | "request";
  full: boolean;
};

const VOTE_CATEGORIES: VoteCategory[] = ["mvp", "melhor_goleiro", "craque", "fair_play"];

/** Overall "conhecido" por jogador — usado só pra montar a resposta mockada de `generateTeams`/`getTeams`. */
const OVERALL_BY_PLAYER_ID: Record<string, number> = {
  "player-1": 75,
  "player-2": 68,
};

let groups: Group[] = [FAKE_GROUP];
let membersByGroup: Record<string, Member[]> = { [FAKE_GROUP.id]: [FAKE_MEMBER] };
let matchesByGroup: Record<string, Match[]> = { [FAKE_GROUP.id]: [FAKE_MATCH] };
let attendanceByMatch: Record<string, Attendance[]> = { [FAKE_MATCH.id]: [FAKE_ATTENDANCE] };
let duesByGroup: Record<string, Due[]> = {};
let teamsByMatch: Record<string, TeamsResult> = {};
let resultByMatch: Record<string, MatchResult> = {};
let statsByMatch: Record<string, MatchStat[]> = {};
let votesByMatch: Record<string, Vote[]> = {};
let voteWindowClosedMatches = new Set<string>();
let reputationByMatch: Record<string, ReputationTag[]> = {};
let reputationByGroup: Record<string, GroupReputationMember[]> = {};
let myPlayer = { ...FAKE_MY_PLAYER };
let upcomingMatches: UpcomingMatch[] = [...FAKE_UPCOMING_MATCHES];
let careerByPlayer: Record<string, Career> = { [FAKE_MY_PLAYER.id]: { ...FAKE_CAREER } };
// Chave por id-OU-slug (a mesma flexibilidade da rota real) — os testes de
// `/j/:slug` semeiam direto pela chave que a tela vai pedir (o slug).
let publicProfileByKey: Record<string, PublicProfile> = {};
let joinRequestsByMatch: Record<string, JoinRequest[]> = {};
let discoverResults: DiscoverMatch[] = [];
let me = { ...FAKE_USER };
let venuesById: Record<string, typeof FAKE_VENUE> = { [FAKE_VENUE.id]: { ...FAKE_VENUE } };
let courtsByVenue: Record<string, Court[]> = { [FAKE_VENUE.id]: [{ ...FAKE_COURT }] };
// Ignora o `date` da query — os testes de disponibilidade não precisam variar por dia,
// só semear/ler os slots retornados por `GET /courts/:id/availability`.
let availabilityByCourt: Record<string, AvailabilitySlot[]> = { [FAKE_COURT.id]: [{ ...FAKE_AVAILABILITY_SLOT }] };

// `POST /bookings` / `GET /bookings/mine` (Task A2 — reservar + pagar PIX).
// `createBookingModeMock` decide o `mode` (e portanto o shape da resposta:
// `request` não tem `payment`); `createBookingPixNullMock` simula o caso
// defensivo em que o backend não conseguiu montar o voucher PIX mesmo em modo
// pago; `createBookingErrorMock` simula os 409/503 do catálogo de erros.
let bookings: Booking[] = [];
let createBookingModeMock: BookingModeValue = "instant";
let createBookingPixNullMock = false;
let createBookingErrorMock: CreateBookingErrorFixture = null;
let bookingIdSeq = 0;
// `POST /bookings/:id/cancel` (Task A3) — força a resposta em erro
// independente do `status` atual da reserva, simulando a corrida em que o
// status já mudou (webhook/expire job) antes do cancelamento chegar (409
// `BKG-T0005`).
let cancelBookingErrorMock: CreateBookingErrorFixture = null;

const FAKE_PIX_VOUCHER: PixVoucherFixture = {
  qrCodeImageUrl: "https://pix.test/qr-code.png",
  copyPaste: "00020126580014BR.GOV.BCB.PIX0136fake-pix-copy-paste-code5204000053039865802BR5913Camisa7 Test6008Sao Paulo62070503***6304ABCD",
  expiresAt: "2026-07-18T13:00:00.000Z",
};

// Entitlements (`GET /billing/me`). Default: pagamentos habilitados, sem
// features. Testes de bypass revisor usam `setBillingMock({ paymentsEnabled: false })`.
let billingMe: { features: string[]; paymentsEnabled: boolean } = {
  features: [],
  paymentsEnabled: true,
};

/** Sobrescreve o retorno de `GET /billing/me` (features/paymentsEnabled). */
export function setBillingMock(next: { features?: string[]; paymentsEnabled?: boolean }) {
  billingMe = {
    features: next.features ?? billingMe.features,
    paymentsEnabled: next.paymentsEnabled ?? billingMe.paymentsEnabled,
  };
}

/** Reseta o estado de billing — chamar em `beforeEach` de testes de billing. */
export function resetBillingMocks() {
  billingMe = { features: [], paymentsEnabled: true };
}

function findMatch(matchId: string): Match | undefined {
  return Object.values(matchesByGroup)
    .flat()
    .find((m) => m.id === matchId);
}

/**
 * Monta a resposta de times a partir dos confirmados da pelada. Todo
 * jogador — inclusive convidado avulso sem registro em `membersByGroup` —
 * recebe um `overall` (fallback 70), reproduzindo o comportamento real do
 * backend depois da correção do bug de "convidado soma 0".
 */
function buildTeams(matchId: string): TeamsResult {
  const confirmed = (attendanceByMatch[matchId] ?? []).filter((a) => a.status === "confirmed");
  const half = Math.ceil(confirmed.length / 2);
  const makeTeam = (team: number, members: Attendance[]) => {
    const players = members.map((a) => ({
      playerId: a.player.id,
      name: a.player.name,
      overall: OVERALL_BY_PLAYER_ID[a.player.id] ?? 70,
    }));
    return { team, overallTotal: players.reduce((sum, p) => sum + p.overall, 0), players };
  };
  return {
    matchId,
    teams: [makeTeam(0, confirmed.slice(0, half)), makeTeam(1, confirmed.slice(half))],
    generatedAt: new Date().toISOString(),
  };
}

/**
 * Reseta o estado em memória usado pelos handlers — chamar em `beforeEach`.
 * Usa cópias rasas dos fixtures (`{ ...FAKE_* }`) para que mutações in-place de
 * um teste (ex.: `finish`/`cancel` alterando `status`) não vazem para o próximo.
 */
export function resetGroupsMocks() {
  groups = [{ ...FAKE_GROUP }];
  membersByGroup = { [FAKE_GROUP.id]: [{ ...FAKE_MEMBER }] };
  matchesByGroup = { [FAKE_GROUP.id]: [{ ...FAKE_MATCH }] };
  attendanceByMatch = { [FAKE_MATCH.id]: [{ ...FAKE_ATTENDANCE }] };
  duesByGroup = {};
  teamsByMatch = {};
  resultByMatch = {};
  statsByMatch = {};
  votesByMatch = {};
  voteWindowClosedMatches = new Set();
  reputationByMatch = {};
  reputationByGroup = {};
  myPlayer = { ...FAKE_MY_PLAYER };
  upcomingMatches = [...FAKE_UPCOMING_MATCHES];
  careerByPlayer = { [FAKE_MY_PLAYER.id]: { ...FAKE_CAREER } };
  publicProfileByKey = {};
  joinRequestsByMatch = {};
  discoverResults = [];
  me = { ...FAKE_USER };
  venuesById = { [FAKE_VENUE.id]: { ...FAKE_VENUE } };
  courtsByVenue = { [FAKE_VENUE.id]: [{ ...FAKE_COURT }] };
  availabilityByCourt = { [FAKE_COURT.id]: [{ ...FAKE_AVAILABILITY_SLOT }] };
  bookings = [];
  createBookingModeMock = "instant";
  createBookingPixNullMock = false;
  createBookingErrorMock = null;
  cancelBookingErrorMock = null;
  bookingIdSeq = 0;
}

/** Troca o `mode` que `POST /bookings` simula (`instant`/`request`/`deposit`) — decide se a resposta traz `payment`. */
export function setCreateBookingModeMock(mode: BookingModeValue) {
  createBookingModeMock = mode;
}

/** Simula o backend não conseguir montar o voucher PIX (`payment.pix: null`) mesmo em modo pago. */
export function setCreateBookingPixNullMock(flag: boolean) {
  createBookingPixNullMock = flag;
}

/** Simula `POST /bookings` falhando com um erro do catálogo (`BKG-T0002`, `CON-T0004`, `BIL-T0001`...). */
export function setCreateBookingErrorMock(error: CreateBookingErrorFixture) {
  createBookingErrorMock = error;
}

/** Lê as reservas persistidas no mock — usado pra asserções de payload (`courtId`/`date`/minutos) nos testes. */
export function getBookingsMock() {
  return bookings;
}

/**
 * Sobrescreve o `status` de uma reserva já criada — simula o webhook do
 * Stripe confirmando o pagamento (ou o job de expiração/cancelamento) do
 * lado do backend, sem passar pelo handler de `POST /bookings` de novo. É
 * assim que os testes de polling avançam `pending_payment` → `confirmed`/
 * `expired`/`cancelled` entre um tick do `refetchInterval` e o outro.
 */
export function setBookingStatusMock(bookingId: string, status: BookingStatusValue) {
  bookings = bookings.map((booking) =>
    booking.id === bookingId ? { ...booking, status, updatedAt: new Date().toISOString() } : booking,
  );
}

/** Semeia `bookings` direto (sem passar por `POST /bookings`) — usado pelos testes de "Minhas reservas". */
export function seedBookingsMock(next: Booking[]) {
  bookings = next;
}

/** Força `POST /bookings/:id/cancel` a falhar com um erro do catálogo (ex.: 409 `BKG-T0005`), independente do status atual. */
export function setCancelBookingErrorMock(error: CreateBookingErrorFixture) {
  cancelBookingErrorMock = error;
}

/** Pré-semeia uma quadra (`GET /venues/:id`) — usado pra exibir a quadra na partida. */
export function setVenueMock(venue: typeof FAKE_VENUE) {
  venuesById[venue.id] = venue;
}

/** Pré-semeia as quadras (`Court`) de uma venue (`GET /venues/:venueId/courts`). */
export function setCourtsMock(venueId: string, next: Court[]) {
  courtsByVenue[venueId] = next;
}

/** Pré-semeia os slots de disponibilidade de uma quadra (`GET /courts/:id/availability`). */
export function setAvailabilityMock(courtId: string, next: AvailabilitySlot[]) {
  availabilityByCourt[courtId] = next;
}

/** Pré-semeia os pedidos de entrada pendentes de uma pelada (inbox do organizador). */
export function setJoinRequestsMock(matchId: string, next: JoinRequest[]) {
  joinRequestsByMatch[matchId] = next;
}

/** Lê os pedidos de entrada persistidos no mock — usado pra asserção de decisão (approve/reject). */
export function getJoinRequestsMock(matchId: string) {
  return joinRequestsByMatch[matchId] ?? [];
}

/** Pré-semeia os resultados de `GET /discover` (peladas públicas por raio). */
export function setDiscoverMock(next: DiscoverMatch[]) {
  discoverResults = next;
}

/** Troca o jogador retornado por `GET /players/me` — usado pra testar outro nome/id logado. */
export function setMyPlayerMock(next: typeof FAKE_MY_PLAYER) {
  myPlayer = next;
}

/** Sobrescreve `GET /players/me/upcoming-matches` — ex.: `[]` pro estado vazio do hero/lista de "Início". */
export function setUpcomingMatchesMock(next: UpcomingMatch[]) {
  upcomingMatches = next;
}

/** Pré-semeia a carreira de um `playerId` — sem entrada, `GET .../career` volta o corpo zerado (bootstrap default). */
export function setCareerMock(playerId: string, career: Career | undefined) {
  if (career) careerByPlayer[playerId] = career;
  else delete careerByPlayer[playerId];
}

/** Pré-semeia o perfil público servido em `/players/:key/public-profile` — `key` é o id ou o slug (`/j/:slug`). */
export function setPublicProfileMock(key: string, profile: PublicProfile | undefined) {
  if (profile) publicProfileByKey[key] = profile;
  else delete publicProfileByKey[key];
}

/** Pré-semeia os times persistidos de uma pelada (simula `generateTeams` já ter rodado antes do teste). */
export function setTeamsMock(matchId: string, result: TeamsResult) {
  teamsByMatch[matchId] = result;
}

export function setGroupsMock(next: Group[]) {
  groups = next;
}

export function setMembersMock(groupId: string, next: Member[]) {
  membersByGroup[groupId] = next;
}

export function setAttendanceMock(matchId: string, next: Attendance[]) {
  attendanceByMatch[matchId] = next;
}

/** Pré-semeia as mensalidades (`GET /groups/:id/dues`) de um grupo — usado pra testar a tela de mensalidades. */
export function setDuesMock(groupId: string, next: Due[]) {
  duesByGroup[groupId] = next;
}

function findDue(dueId: string): Due | undefined {
  return Object.values(duesByGroup)
    .flat()
    .find((d) => d.id === dueId);
}

/** Troca o `status` de uma pelada já semeada — usado pra simular o pós-jogo (`finished`/`closed`) nos testes de Fase 1. */
export function setMatchStatusMock(matchId: string, status: Match["status"]) {
  const match = findMatch(matchId);
  if (!match) return;
  const updated = { ...match, status };
  matchesByGroup[match.groupId] = (matchesByGroup[match.groupId] ?? []).map((m) => (m.id === matchId ? updated : m));
}

/** Pré-semeia o resultado registrado de uma pelada (simula `recordResult` já ter rodado). */
export function setResultMock(matchId: string, result: MatchResult | undefined) {
  if (result) resultByMatch[matchId] = result;
  else delete resultByMatch[matchId];
}

/** Pré-semeia as estatísticas lançadas de uma pelada (simula `logStats` já ter rodado). */
export function setStatsMock(matchId: string, stats: MatchStat[]) {
  statsByMatch[matchId] = stats;
}

/** Pré-semeia os votos já registrados de uma pelada (pra testar a tally sem precisar votar antes). */
export function setVotesMock(matchId: string, votes: Vote[]) {
  votesByMatch[matchId] = votes;
}

/** Liga/desliga a janela de votação fechada (`VOTE.WINDOW_CLOSED`, 409) pra uma pelada — testa o estado "votação encerrada". */
export function setVoteWindowClosedMock(matchId: string, closed: boolean) {
  if (closed) voteWindowClosedMatches.add(matchId);
  else voteWindowClosedMatches.delete(matchId);
}

/** Lê o resultado persistido no mock — usado pra asserções precisas de payload (`recordResult`) nos testes. */
export function getResultMock(matchId: string) {
  return resultByMatch[matchId];
}

/** Lê as estatísticas persistidas no mock — usado pra asserções precisas de payload (`logStats`) nos testes. */
export function getStatsMock(matchId: string) {
  return statsByMatch[matchId] ?? [];
}

/** Lê os votos persistidos no mock — usado pra asserções precisas de payload (`castVote`) nos testes. */
export function getVotesMock(matchId: string) {
  return votesByMatch[matchId] ?? [];
}

/** Pré-semeia as tags de reputação já registradas (simula hidratação via `GET /matches/:id/reputation`). */
export function setReputationMock(matchId: string, tags: ReputationTag[]) {
  reputationByMatch[matchId] = tags;
}

/** Lê as tags de reputação persistidas no mock — usado pra asserções precisas de payload (`setReputation`) nos testes. */
export function getReputationMock(matchId: string) {
  return reputationByMatch[matchId] ?? [];
}

/** Pré-semeia `GET /groups/:id/reputation` — visão do organizador (contagens por membro). */
export function setGroupReputationMock(groupId: string, members: GroupReputationMember[]) {
  reputationByGroup[groupId] = members;
}

export const handlers = [
  http.post(api("/auth/login"), async ({ request }) => {
    const body = (await request.json()) as { email: string; password: string };
    if (body.password !== "correct-password") {
      return HttpResponse.json({ message: "invalid_credentials" }, { status: 401 });
    }
    return HttpResponse.json({
      accessToken: "fake-access-token",
      refreshToken: "fake-refresh-token",
      user: FAKE_USER,
    });
  }),

  http.post(api("/auth/login-google"), async ({ request }) => {
    const body = (await request.json()) as { idToken: string };
    if (!body.idToken) {
      return HttpResponse.json({ message: "invalid_id_token" }, { status: 401 });
    }
    return HttpResponse.json({
      accessToken: "fake-google-access-token",
      refreshToken: "fake-google-refresh-token",
      user: FAKE_USER,
    });
  }),

  http.post(api("/auth/register"), async ({ request }) => {
    const body = (await request.json()) as {
      email: string;
      name: string;
      roles?: ("jogador" | "organizador" | "quadra")[];
    };
    me = {
      ...FAKE_USER,
      email: body.email,
      name: body.name,
      roles: body.roles && body.roles.length > 0 ? body.roles : ["jogador"],
    };
    return HttpResponse.json(
      {
        accessToken: "fake-access-token",
        refreshToken: "fake-refresh-token",
        user: me,
      },
      { status: 201 },
    );
  }),

  http.get(api("/auth/me"), () => {
    return HttpResponse.json(me);
  }),

  http.patch(api("/auth/me/roles"), async ({ request }) => {
    const body = (await request.json()) as { roles: ("jogador" | "organizador" | "quadra")[] };
    me = { ...me, roles: body.roles };
    return HttpResponse.json(me);
  }),

  http.get(api("/venues/:id"), ({ params }) => {
    const venue = venuesById[params.id as string];
    if (!venue) return HttpResponse.json({ message: "not_found" }, { status: 404 });
    return HttpResponse.json(venue);
  }),

  http.get(api("/venues/:venueId/courts"), ({ params }) => {
    return HttpResponse.json(courtsByVenue[params.venueId as string] ?? []);
  }),

  http.get(api("/courts/:id/availability"), ({ params }) => {
    return HttpResponse.json(availabilityByCourt[params.id as string] ?? []);
  }),

  http.post(api("/bookings"), async ({ request }) => {
    if (createBookingErrorMock) {
      const { status, code } = createBookingErrorMock;
      return HttpResponse.json({ status, code, message: code, trace_id: "test-trace" }, { status });
    }

    const body = (await request.json()) as {
      courtId: string;
      date: string;
      startMinute: number;
      endMinute: number;
    };
    const mode = createBookingModeMock;
    bookingIdSeq += 1;
    const id = `booking-${bookingIdSeq}`;
    const now = new Date().toISOString();
    const priceCents = FAKE_AVAILABILITY_SLOT.priceCents;

    const booking: Booking = {
      id,
      courtId: body.courtId,
      bookedById: FAKE_USER.id,
      date: body.date,
      startMinute: body.startMinute,
      endMinute: body.endMinute,
      priceCents,
      mode,
      status: mode === "request" ? "requested" : "pending_payment",
      depositCents: mode === "deposit" ? Math.round(priceCents * 0.3) : null,
      stripePaymentIntentId: mode === "request" ? null : `pi_${id}`,
      createdAt: now,
      updatedAt: now,
    };
    bookings = [...bookings, booking];

    if (mode === "request") {
      return HttpResponse.json({ booking }, { status: 201 });
    }

    return HttpResponse.json(
      {
        booking,
        payment: {
          paymentIntentId: `pi_${id}`,
          clientSecret: `secret_${id}`,
          pix: createBookingPixNullMock ? null : { ...FAKE_PIX_VOUCHER },
        },
      },
      { status: 201 },
    );
  }),

  http.get(api("/bookings/mine"), () => {
    return HttpResponse.json(bookings);
  }),

  // `POST /bookings/:id/cancel` (Task A3) — espelha `CANCELLABLE_STATUSES` de
  // `cancel-booking.service.ts`: só sai de `requested`/`pending_payment`/
  // `confirmed`; qualquer outro status vira 409 `BKG-T0005` (`BAD_STATE`),
  // sem mutar nada — mesmo caminho que o backend usa pra corrida perdida.
  http.post(api("/bookings/:id/cancel"), ({ params }) => {
    if (cancelBookingErrorMock) {
      const { status, code } = cancelBookingErrorMock;
      return HttpResponse.json({ status, code, message: code, trace_id: "test-trace" }, { status });
    }

    const id = params.id as string;
    const booking = bookings.find((b) => b.id === id);
    if (!booking) {
      return HttpResponse.json(
        { status: 404, code: "BKG-T0001", message: "BKG-T0001", trace_id: "test-trace" },
        { status: 404 },
      );
    }

    const cancellable: BookingStatusValue[] = ["requested", "pending_payment", "confirmed"];
    if (!cancellable.includes(booking.status)) {
      return HttpResponse.json(
        { status: 409, code: "BKG-T0005", message: "BKG-T0005", trace_id: "test-trace" },
        { status: 409 },
      );
    }

    const updated: Booking = { ...booking, status: "cancelled", updatedAt: new Date().toISOString() };
    bookings = bookings.map((b) => (b.id === id ? updated : b));
    return HttpResponse.json(updated);
  }),

  http.get(api("/groups"), () => {
    return HttpResponse.json(groups);
  }),

  http.post(api("/groups"), async ({ request }) => {
    const body = (await request.json()) as { name: string; statsMode?: string };
    const created: Group = {
      id: `group-${groups.length + 1}`,
      name: body.name,
      ownerId: FAKE_USER.id,
      statsMode: body.statsMode ?? "organizador",
      isPublic: false,
      joinPolicy: "open",
      createdAt: new Date().toISOString(),
      memberCount: 1,
      nextMatch: null,
    };
    groups = [...groups, created];
    return HttpResponse.json(created, { status: 201 });
  }),

  http.get(api("/groups/:id"), ({ params }) => {
    const group = groups.find((g) => g.id === params.id) ?? FAKE_GROUP;
    return HttpResponse.json(group);
  }),

  http.patch(api("/groups/:id"), async ({ request, params }) => {
    const groupId = params.id as string;
    const body = (await request.json()) as {
      monthlyFeeCents?: number | null;
      isPublic?: boolean;
      joinPolicy?: "open" | "request";
    };
    const existing = groups.find((g) => g.id === groupId) ?? { ...FAKE_GROUP, id: groupId };
    const updated: Group = {
      ...existing,
      monthlyFeeCents: "monthlyFeeCents" in body ? (body.monthlyFeeCents ?? null) : existing.monthlyFeeCents,
      isPublic: "isPublic" in body ? !!body.isPublic : existing.isPublic,
      joinPolicy: body.joinPolicy ?? existing.joinPolicy,
    };
    groups = groups.some((g) => g.id === groupId)
      ? groups.map((g) => (g.id === groupId ? updated : g))
      : [...groups, updated];
    return HttpResponse.json(updated);
  }),

  http.get(api("/groups/:id/members"), ({ params }) => {
    return HttpResponse.json(membersByGroup[params.id as string] ?? []);
  }),

  http.get(api("/groups/:id/reputation"), ({ params }) => {
    return HttpResponse.json({ members: reputationByGroup[params.id as string] ?? [] });
  }),

  http.post(api("/groups/:id/members"), async ({ request, params }) => {
    // Task 1 (backend, UX overhaul): body minimizado — o membro entra "sem
    // nota" (`primaryPos: null`) e se autodeclara depois; ver
    // `add-member.schema.ts` no backend.
    const body = (await request.json()) as {
      name: string;
      phone?: string;
      billingMode?: "mensalista" | "avulso";
    };
    const groupId = params.id as string;
    const created: Member = {
      id: `member-${(membersByGroup[groupId]?.length ?? 0) + 1}`,
      groupId,
      role: "jogador",
      primaryPos: null,
      secondaryPos: [],
      affinity: {},
      seedOverall: {},
      billingMode: body.billingMode ?? "avulso",
      monthlyFeeCentsOverride: null,
      player: {
        id: `player-${groupId}-new`,
        userId: null,
        name: body.name,
        phone: body.phone ?? null,
        affinity: {},
      },
    };
    membersByGroup[groupId] = [...(membersByGroup[groupId] ?? []), created];
    return HttpResponse.json(created, { status: 201 });
  }),

  http.patch(api("/groups/:id/members/:memberId"), async ({ request, params }) => {
    const body = await request.json();
    const groupId = params.id as string;
    const memberId = params.memberId as string;
    const existing =
      membersByGroup[groupId]?.find((m) => m.id === memberId) ?? { ...FAKE_MEMBER, id: memberId, groupId };
    const updated = { ...existing, ...(body as object) };
    membersByGroup[groupId] = (membersByGroup[groupId] ?? []).map((m) => (m.id === memberId ? updated : m));
    return HttpResponse.json(updated);
  }),

  http.get(api("/groups/:id/matches"), ({ params }) => {
    return HttpResponse.json(matchesByGroup[params.id as string] ?? []);
  }),

  http.post(api("/groups/:id/matches"), async ({ request, params }) => {
    const body = (await request.json()) as {
      datetime: string;
      location: string;
      priceCents?: number;
      slots: number;
      pixKey?: string;
      recurrenceRule?: { weekly: true; weekday: number; time: string } | null;
    };
    const groupId = params.id as string;
    const created: Match = {
      id: `match-${Object.values(matchesByGroup).flat().length + 1}`,
      groupId,
      datetime: body.datetime,
      location: body.location,
      priceCents: body.priceCents ?? 0,
      slots: body.slots,
      pixKey: body.pixKey ?? null,
      status: "open",
      recurrenceRule: body.recurrenceRule ?? null,
      createdAt: new Date().toISOString(),
    };
    matchesByGroup[groupId] = [...(matchesByGroup[groupId] ?? []), created];
    return HttpResponse.json(created, { status: 201 });
  }),

  http.get(api("/matches/:id"), ({ params }) => {
    const match = findMatch(params.id as string);
    if (!match) return HttpResponse.json({ message: "not_found" }, { status: 404 });
    return HttpResponse.json(match);
  }),

  http.patch(api("/matches/:id"), async ({ request, params }) => {
    const match = findMatch(params.id as string);
    if (!match) return HttpResponse.json({ message: "not_found" }, { status: 404 });
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json({ ...match, ...body });
  }),

  http.post(api("/matches/:id/finish"), ({ params }) => {
    const matchId = params.id as string;
    const match = findMatch(matchId);
    if (!match) return HttpResponse.json({ message: "not_found" }, { status: 404 });
    const updated = { ...match, status: "finished" as const };
    matchesByGroup[match.groupId] = (matchesByGroup[match.groupId] ?? []).map((m) =>
      m.id === matchId ? updated : m,
    );
    return HttpResponse.json(updated);
  }),

  http.post(api("/matches/:id/cancel"), ({ params }) => {
    const matchId = params.id as string;
    const match = findMatch(matchId);
    if (!match) return HttpResponse.json({ message: "not_found" }, { status: 404 });
    const updated = { ...match, status: "cancelled" as const };
    matchesByGroup[match.groupId] = (matchesByGroup[match.groupId] ?? []).map((m) =>
      m.id === matchId ? updated : m,
    );
    return HttpResponse.json(updated);
  }),

  http.get(api("/matches/:id/attendance"), ({ params }) => {
    return HttpResponse.json(attendanceByMatch[params.id as string] ?? []);
  }),

  http.post(api("/matches/:id/attendance"), ({ params }) => {
    const matchId = params.id as string;
    const current = attendanceByMatch[matchId] ?? [];
    const created: Attendance = {
      id: `att-${current.length + 1}`,
      matchId,
      status: "confirmed",
      waitlistPos: null,
      paymentStatus: "pending",
      paidConfirmedById: null,
      player: { id: `player-${FAKE_USER.id}`, userId: FAKE_USER.id, name: FAKE_USER.name, phone: null },
    };
    attendanceByMatch[matchId] = [...current, created];
    return HttpResponse.json(created, { status: 201 });
  }),

  http.post(api("/matches/:id/attendance/:attId/cancel"), ({ params }) => {
    const matchId = params.id as string;
    const attId = params.attId as string;
    const current = attendanceByMatch[matchId] ?? [];
    const cancelled = current.find((a) => a.id === attId);
    attendanceByMatch[matchId] = current.filter((a) => a.id !== attId);
    return HttpResponse.json({ cancelled: cancelled ?? null, promoted: null });
  }),

  http.post(api("/matches/:id/attendance/:attId/mark-paid"), ({ params }) => {
    const matchId = params.id as string;
    const attId = params.attId as string;
    const current = attendanceByMatch[matchId] ?? [];
    const updated = current.map((a) => (a.id === attId ? { ...a, paymentStatus: "paid" as const } : a));
    attendanceByMatch[matchId] = updated;
    return HttpResponse.json(updated.find((a) => a.id === attId));
  }),

  http.post(api("/matches/:id/attendance/:attId/confirm-payment"), async ({ request, params }) => {
    const matchId = params.id as string;
    const attId = params.attId as string;
    const body = ((await request.json().catch(() => null)) as { paid?: boolean } | null) ?? {};
    const paid = body.paid ?? true;
    const current = attendanceByMatch[matchId] ?? [];
    const updated = current.map((a) =>
      a.id === attId
        ? { ...a, paymentStatus: paid ? ("paid" as const) : ("pending" as const), paidConfirmedById: paid ? FAKE_USER.id : null }
        : a,
    );
    attendanceByMatch[matchId] = updated;
    return HttpResponse.json(updated.find((a) => a.id === attId));
  }),

  http.get(api("/groups/:id/dues"), ({ params, request }) => {
    const groupId = params.id as string;
    const url = new URL(request.url);
    const month = url.searchParams.get("month");
    const dues = duesByGroup[groupId] ?? [];
    const filtered = month ? dues.filter((d) => d.competencyMonth === month) : dues;
    return HttpResponse.json(filtered);
  }),

  http.post(api("/dues/:id/confirm"), async ({ request, params }) => {
    const dueId = params.id as string;
    const body = ((await request.json().catch(() => null)) as { paid?: boolean } | null) ?? {};
    const paid = body.paid ?? true;
    const due = findDue(dueId);
    if (!due) return HttpResponse.json({ message: "not_found" }, { status: 404 });
    const updated: Due = {
      ...due,
      status: paid ? "paid" : "pending",
      paidConfirmedById: paid ? FAKE_USER.id : null,
    };
    duesByGroup[due.groupId] = (duesByGroup[due.groupId] ?? []).map((d) => (d.id === dueId ? updated : d));
    return HttpResponse.json(updated);
  }),

  http.post(api("/dues/:id/mark-paid"), ({ params }) => {
    const dueId = params.id as string;
    const due = findDue(dueId);
    if (!due) return HttpResponse.json({ message: "not_found" }, { status: 404 });
    const updated: Due = { ...due, status: "paid" };
    duesByGroup[due.groupId] = (duesByGroup[due.groupId] ?? []).map((d) => (d.id === dueId ? updated : d));
    return HttpResponse.json(updated);
  }),

  http.post(api("/matches/:id/teams"), ({ params }) => {
    const matchId = params.id as string;
    const result = buildTeams(matchId);
    teamsByMatch[matchId] = result;
    return HttpResponse.json(result);
  }),

  http.get(api("/matches/:id/teams"), ({ params }) => {
    const matchId = params.id as string;
    const existing = teamsByMatch[matchId];
    if (!existing) return HttpResponse.json({ message: "not_found" }, { status: 404 });
    return HttpResponse.json(existing);
  }),

  http.post(api("/matches/:id/invite"), ({ params }) => {
    const matchId = params.id as string;
    return HttpResponse.json({ token: `invite-token-${matchId}`, sharePath: `/invite/invite-token-${matchId}` }, { status: 201 });
  }),

  http.post(api("/matches/:id/result"), async ({ request, params }) => {
    const matchId = params.id as string;
    const body = (await request.json()) as { scores: { team: number; goals: number }[]; winnerTeam?: number | null };
    const created: MatchResult = {
      matchId,
      scores: body.scores,
      winnerTeam: body.winnerTeam ?? null,
      recordedById: FAKE_USER.id,
      recordedAt: new Date().toISOString(),
    };
    resultByMatch[matchId] = created;
    return HttpResponse.json(created);
  }),

  http.get(api("/matches/:id/result"), ({ params }) => {
    const existing = resultByMatch[params.id as string];
    if (!existing) return HttpResponse.json({ message: "not_found" }, { status: 404 });
    return HttpResponse.json(existing);
  }),

  http.post(api("/matches/:id/stats"), async ({ request, params }) => {
    const matchId = params.id as string;
    const body = (await request.json()) as {
      stats: { playerId: string; team?: number; goals?: number; assists?: number; ownGoals?: number; cleanSheet?: boolean }[];
    };
    const now = new Date().toISOString();
    const byPlayer = new Map((statsByMatch[matchId] ?? []).map((entry) => [entry.playerId, entry]));
    const updated: MatchStat[] = body.stats.map((entry) => {
      const prior = byPlayer.get(entry.playerId);
      return {
        id: prior?.id ?? `stat-${matchId}-${entry.playerId}`,
        matchId,
        playerId: entry.playerId,
        team: entry.team ?? prior?.team ?? null,
        goals: entry.goals ?? 0,
        assists: entry.assists ?? 0,
        ownGoals: entry.ownGoals ?? 0,
        cleanSheet: entry.cleanSheet ?? false,
        source: "organizador",
        createdAt: prior?.createdAt ?? now,
        updatedAt: now,
      };
    });
    statsByMatch[matchId] = updated;
    return HttpResponse.json(updated);
  }),

  http.get(api("/matches/:id/stats"), ({ params }) => {
    return HttpResponse.json(statsByMatch[params.id as string] ?? []);
  }),

  http.post(api("/matches/:id/votes"), async ({ request, params }) => {
    const matchId = params.id as string;
    if (voteWindowClosedMatches.has(matchId)) {
      return HttpResponse.json({ message: "vote_window_closed" }, { status: 409 });
    }
    const body = (await request.json()) as { category: VoteCategory; votedPlayerId: string };
    const attendance = attendanceByMatch[matchId] ?? [];
    const voterAttendance = attendance.find((a) => a.player.userId === FAKE_USER.id);
    const voterPlayerId = voterAttendance?.player.id ?? `player-${FAKE_USER.id}`;

    const current = votesByMatch[matchId] ?? [];
    const now = new Date().toISOString();
    const existingIndex = current.findIndex((v) => v.voterPlayerId === voterPlayerId && v.category === body.category);
    const vote: Vote = {
      id: existingIndex >= 0 ? current[existingIndex]!.id : `vote-${matchId}-${current.length + 1}`,
      matchId,
      voterPlayerId,
      category: body.category,
      votedPlayerId: body.votedPlayerId,
      createdAt: existingIndex >= 0 ? current[existingIndex]!.createdAt : now,
      updatedAt: now,
    };
    const next = existingIndex >= 0 ? current.map((v, i) => (i === existingIndex ? vote : v)) : [...current, vote];
    votesByMatch[matchId] = next;
    return HttpResponse.json(vote);
  }),

  http.get(api("/matches/:id/votes/tally"), ({ params }) => {
    const matchId = params.id as string;
    const votes = votesByMatch[matchId] ?? [];
    const tally = VOTE_CATEGORIES.map((category) => {
      const counts = new Map<string, number>();
      votes
        .filter((v) => v.category === category)
        .forEach((v) => counts.set(v.votedPlayerId, (counts.get(v.votedPlayerId) ?? 0) + 1));
      const tallyRows = Array.from(counts.entries()).map(([playerId, count]) => ({ playerId, votes: count }));
      let leaderPlayerId: string | null = null;
      if (tallyRows.length > 0) {
        const max = Math.max(...tallyRows.map((row) => row.votes));
        const leaders = tallyRows.filter((row) => row.votes === max);
        leaderPlayerId = leaders.length === 1 ? leaders[0]!.playerId : null;
      }
      return { category, tally: tallyRows, leaderPlayerId };
    });
    return HttpResponse.json(tally);
  }),

  http.get(api("/matches/:id/reputation"), ({ params }) => {
    const matchId = params.id as string;
    return HttpResponse.json({ tags: reputationByMatch[matchId] ?? [] });
  }),

  http.put(api("/matches/:id/reputation"), async ({ request, params }) => {
    const matchId = params.id as string;
    const body = (await request.json()) as { tags: ReputationTag[] };
    reputationByMatch[matchId] = body.tags;
    return HttpResponse.json({ tags: body.tags });
  }),

  http.post(api("/matches/:id/finalize"), ({ params }) => {
    const matchId = params.id as string;
    const match = findMatch(matchId);
    if (!match) return HttpResponse.json({ message: "not_found" }, { status: 404 });
    if (match.status !== "finished") {
      return HttpResponse.json({ message: "match_not_finalizable" }, { status: 409 });
    }
    if (!resultByMatch[matchId]) return HttpResponse.json({ message: "result_not_found" }, { status: 404 });
    const updated = { ...match, status: "closed" as const };
    matchesByGroup[match.groupId] = (matchesByGroup[match.groupId] ?? []).map((m) => (m.id === matchId ? updated : m));
    return HttpResponse.json(updated);
  }),

  http.get(api("/players/me"), () => {
    return HttpResponse.json(myPlayer);
  }),

  http.get(api("/players/me/upcoming-matches"), () => {
    return HttpResponse.json(upcomingMatches);
  }),

  http.get(api("/players/:playerId/career"), ({ params }) => {
    const playerId = params.playerId as string;
    return HttpResponse.json(careerByPlayer[playerId] ?? emptyCareer(playerId));
  }),
  http.get(api("/players/:playerId/public-profile"), ({ params }) => {
    const key = params.playerId as string;
    const profile = publicProfileByKey[key];
    if (!profile) return HttpResponse.json({ message: "not_found" }, { status: 404 });
    return HttpResponse.json(profile);
  }),
  http.get(api("/players/:playerId/timeline"), () => HttpResponse.json({ events: [] })),

  http.get(api("/discover"), () => HttpResponse.json(discoverResults)),

  http.post(api("/matches/:id/join-request"), ({ params }) => {
    const matchId = params.id as string;
    const current = joinRequestsByMatch[matchId] ?? [];
    const created: JoinRequest = {
      id: `jr-${matchId}-${current.length + 1}`,
      matchId,
      playerId: `player-${FAKE_USER.id}`,
      playerName: FAKE_USER.name,
      createdAt: new Date().toISOString(),
    };
    joinRequestsByMatch[matchId] = [...current, created];
    return HttpResponse.json(
      { id: created.id, matchId, playerId: created.playerId, status: "pending", createdAt: created.createdAt },
      { status: 201 },
    );
  }),

  http.get(api("/matches/:id/join-requests"), ({ params }) => {
    return HttpResponse.json(joinRequestsByMatch[params.id as string] ?? []);
  }),

  http.post(api("/matches/:id/join-requests/:reqId/decision"), async ({ request, params }) => {
    const matchId = params.id as string;
    const reqId = params.reqId as string;
    const body = (await request.json()) as { approve: boolean };
    const current = joinRequestsByMatch[matchId] ?? [];
    const target = current.find((r) => r.id === reqId);
    // Aprovar/recusar remove o pedido da lista de pendentes.
    joinRequestsByMatch[matchId] = current.filter((r) => r.id !== reqId);
    return HttpResponse.json({
      id: reqId,
      matchId,
      playerId: target?.playerId ?? "player-x",
      status: body.approve ? "approved" : "rejected",
      decidedById: FAKE_USER.id,
      createdAt: target?.createdAt ?? new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }),

  http.get(api("/billing/me"), () => HttpResponse.json(billingMe)),
  http.get(api("/billing/plans"), () =>
    HttpResponse.json({
      plans: [
        {
          key: "organizer",
          features: ["public_groups", "organizer_ai", "seasons", "advanced_stats", "cosmetics"],
          includes: "player",
          price: { amountCents: 1990, currency: "brl", interval: "month" },
        },
        {
          key: "player",
          features: ["advanced_stats", "cosmetics"],
          includes: null,
          price: { amountCents: 990, currency: "brl", interval: "month" },
        },
      ],
    }),
  ),
  http.post(api("/billing/checkout"), () =>
    HttpResponse.json({ url: "https://checkout.stripe.test/session" }),
  ),
  http.post(api("/billing/portal"), () =>
    HttpResponse.json({ url: "https://portal.stripe.test/session" }),
  ),
];
