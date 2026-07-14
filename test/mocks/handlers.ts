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

type Group = typeof FAKE_GROUP;
type Member = typeof FAKE_MEMBER;

let groups: Group[] = [FAKE_GROUP];
let membersByGroup: Record<string, Member[]> = { [FAKE_GROUP.id]: [FAKE_MEMBER] };

/** Reseta o estado em memória usado pelos handlers de grupos/membros — chamar em `beforeEach`. */
export function resetGroupsMocks() {
  groups = [FAKE_GROUP];
  membersByGroup = { [FAKE_GROUP.id]: [FAKE_MEMBER] };
}

export function setGroupsMock(next: Group[]) {
  groups = next;
}

export function setMembersMock(groupId: string, next: Member[]) {
  membersByGroup[groupId] = next;
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

  http.get(api("/groups/:id/matches"), () => {
    return HttpResponse.json([]);
  }),
];
