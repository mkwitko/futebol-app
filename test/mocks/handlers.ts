import { http, HttpResponse } from "msw";
import { env } from "@/env";

const api = (path: string) => `${env.EXPO_PUBLIC_API_URL}${path}`;

const FAKE_USER = {
  id: "user-1",
  email: "alice@futebol.app",
  name: "Alice",
  hasPassword: true,
  googleSub: null,
  createdAt: "2026-01-01T00:00:00.000Z",
};

export const FAKE_GROUP = {
  id: "group-1",
  name: "Pelada dos Amigos",
  ownerId: "user-1",
  statsMode: "organizador",
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
  primaryPos: "atacante",
  secondaryPos: [] as string[],
  affinity: { atacante: 80 } as Record<string, number>,
  seedOverall: { atacante: 75 } as Record<string, number>,
  player: { id: "player-1", userId: null as string | null, name: "Zico", phone: null as string | null },
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
};

type Group = typeof FAKE_GROUP;
type Member = typeof FAKE_MEMBER;
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
let teamsByMatch: Record<string, TeamsResult> = {};
let resultByMatch: Record<string, MatchResult> = {};
let statsByMatch: Record<string, MatchStat[]> = {};
let votesByMatch: Record<string, Vote[]> = {};
let voteWindowClosedMatches = new Set<string>();

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
  teamsByMatch = {};
  resultByMatch = {};
  statsByMatch = {};
  votesByMatch = {};
  voteWindowClosedMatches = new Set();
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

  http.post(api("/auth/register"), async () => {
    return HttpResponse.json(
      {
        accessToken: "fake-access-token",
        refreshToken: "fake-refresh-token",
        user: FAKE_USER,
      },
      { status: 201 },
    );
  }),

  http.get(api("/auth/me"), () => {
    return HttpResponse.json(FAKE_USER);
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

  http.get(api("/groups/:id/members"), ({ params }) => {
    return HttpResponse.json(membersByGroup[params.id as string] ?? []);
  }),

  http.post(api("/groups/:id/members"), async ({ request, params }) => {
    const body = (await request.json()) as {
      name: string;
      phone?: string;
      primaryPos: string;
      secondaryPos?: string[];
      affinity?: Record<string, number>;
      seedOverall?: Record<string, number>;
    };
    const groupId = params.id as string;
    const created: Member = {
      id: `member-${(membersByGroup[groupId]?.length ?? 0) + 1}`,
      groupId,
      role: "jogador",
      primaryPos: body.primaryPos,
      secondaryPos: body.secondaryPos ?? [],
      affinity: body.affinity ?? {},
      seedOverall: body.seedOverall ?? {},
      player: { id: `player-${groupId}-new`, userId: null, name: body.name, phone: body.phone ?? null },
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
];
