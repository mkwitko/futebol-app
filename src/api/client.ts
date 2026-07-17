import { getAccessToken } from "@/lib/auth/tokens";
import { forceLogout, refreshAccessToken } from "@/lib/auth/session";
import { env } from "@/env";

export type RequestConfig<TData = unknown> = {
  method?: "GET" | "PUT" | "PATCH" | "POST" | "DELETE" | "OPTIONS" | "HEAD";
  url?: string;
  baseURL?: string;
  params?: Record<string, unknown>;
  data?: TData | FormData;
  headers?: Record<string, string>;
  signal?: AbortSignal;
};

export type ResponseConfig<TData = unknown> = {
  data: TData;
  status: number;
  statusText: string;
  headers: Headers;
};

export type ResponseErrorConfig<TError = unknown> = {
  data: TError;
  status: number;
  statusText: string;
};

/**
 * Tipo da função client — usado pelos hooks gerados pelo Kubb (opção `client?`).
 * O segundo generic (erro) não é referenciado no corpo do tipo, mas precisa
 * existir para casar a aridade com as chamadas `request<TData, TError, TVariables>(...)`
 * feitas pelo código gerado.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- ver comentário acima
export type Client = <TData, _TError = unknown, TVariables = unknown>(
  config: RequestConfig<TVariables>,
) => Promise<ResponseConfig<TData>>;

export class ApiError<TError = unknown> extends Error {
  constructor(
    public readonly status: number,
    public readonly statusText: string,
    public readonly data: TError,
  ) {
    super(`API ${status} ${statusText}`);
    this.name = "ApiError";
  }
}

const IS_TEST = env.EXPO_PUBLIC_ENV === "test";

function buildQuery(params?: Record<string, unknown>): string {
  if (!params) return "";
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) continue;
    search.set(key, String(value));
  }
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

async function buildBody(data: unknown, headers: Headers): Promise<BodyInit | undefined> {
  if (data === undefined) return undefined;
  if (data instanceof FormData) return data; // não fixa Content-Type — o runtime define o boundary
  headers.set("Content-Type", "application/json");
  return JSON.stringify(data);
}

async function parseResponseBody(res: Response): Promise<unknown> {
  const contentType = res.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    try {
      return await res.json();
    } catch {
      return undefined;
    }
  }
  const text = await res.text();
  return text.length > 0 ? text : undefined;
}

/**
 * Timeout duro por requisição. `fetch` não tem timeout nativo — sem isto, um
 * backend inalcançável/lento (ex.: túnel ngrok dormindo) deixa a request
 * pendente pra sempre, o que trava telas que bloqueiam em `isPending`
 * (ex.: o gate de onboarding no root). Abortar vira erro → o React Query
 * resolve o estado.
 */
const REQUEST_TIMEOUT_MS = 15_000;

async function performFetch<TVariables>(
  config: RequestConfig<TVariables>,
  token: string | undefined,
): Promise<Response> {
  const baseURL = config.baseURL ?? env.EXPO_PUBLIC_API_URL;
  const url = `${baseURL}${config.url ?? ""}${buildQuery(config.params)}`;

  const headers = new Headers(config.headers);
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const body = await buildBody(config.data, headers);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  // Encadeia o cancelamento externo (React Query cancela via `config.signal`).
  const onExternalAbort = () => controller.abort();
  config.signal?.addEventListener("abort", onExternalAbort);

  try {
    return await fetch(url, {
      method: config.method ?? "GET",
      headers,
      body,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeoutId);
    config.signal?.removeEventListener("abort", onExternalAbort);
  }
}

/**
 * Wrapper de fetch consumido pelos hooks gerados pelo Kubb (`client.importPath`
 * em `kubb.config.ts`). Injeta `Authorization: Bearer <accessToken>` a partir do
 * `expo-secure-store`. Em um 401, tenta renovar via `POST /auth/refresh`
 * **uma única vez** e reenvia a requisição original; se o refresh falhar,
 * força logout (`forceLogout()` limpa a sessão e navega para `(auth)/sign-in`).
 */
async function client<TData, _TError = unknown, TVariables = unknown>(
  config: RequestConfig<TVariables>,
): Promise<ResponseConfig<TData>> {
  const token = IS_TEST ? "test-access-token" : await getAccessToken();

  let res = await performFetch<TVariables>(config, token ?? undefined);

  if (res.status === 401 && !IS_TEST) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      res = await performFetch<TVariables>(config, refreshed.accessToken);
    } else {
      await forceLogout();
    }
  }

  const payload = await parseResponseBody(res);

  if (!res.ok) {
    throw new ApiError(res.status, res.statusText, payload as _TError);
  }

  return {
    data: payload as TData,
    status: res.status,
    statusText: res.statusText,
    headers: res.headers,
  };
}

export default client;
