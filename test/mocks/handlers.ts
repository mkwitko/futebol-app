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
];
