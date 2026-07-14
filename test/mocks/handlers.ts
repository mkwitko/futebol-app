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

let groups: Group[] = [FAKE_GROUP];
let membersByGroup: Record<string, Member[]> = { [FAKE_GROUP.id]: [FAKE_MEMBER] };
let matchesByGroup: Record<string, Match[]> = { [FAKE_GROUP.id]: [FAKE_MATCH] };
let attendanceByMatch: Record<string, Attendance[]> = { [FAKE_MATCH.id]: [FAKE_ATTENDANCE] };

function findMatch(matchId: string): Match | undefined {
  return Object.values(matchesByGroup)
    .flat()
    .find((m) => m.id === matchId);
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
    const confirmed = (attendanceByMatch[matchId] ?? []).filter((a) => a.status === "confirmed");
    const half = Math.ceil(confirmed.length / 2);
    return HttpResponse.json({
      matchId,
      teams: [
        { team: 0, players: confirmed.slice(0, half).map((a) => ({ playerId: a.player.id, name: a.player.name })) },
        { team: 1, players: confirmed.slice(half).map((a) => ({ playerId: a.player.id, name: a.player.name })) },
      ],
      generatedAt: new Date().toISOString(),
    });
  }),

  http.post(api("/matches/:id/invite"), ({ params }) => {
    const matchId = params.id as string;
    return HttpResponse.json({ token: `invite-token-${matchId}`, sharePath: `/invite/invite-token-${matchId}` }, { status: 201 });
  }),
];
