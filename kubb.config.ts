import { type Config, defineConfig } from "@kubb/core";
import { pluginOas } from "@kubb/plugin-oas";
import { pluginReactQuery } from "@kubb/plugin-react-query";
import { pluginTs } from "@kubb/plugin-ts";

export default defineConfig({
  root: ".",
  input: {
    // Fixture OpenAPI commitada na raiz do repo (copiada do backend).
    // Para gerar contra o backend ao vivo, troque por uma URL, ex.:
    // path: "http://localhost:3333/docs/json",
    path: "openapi.json",
  },
  output: {
    path: "./src/api/generated",
    clean: true,
  },
  plugins: [
    pluginOas(),

    // Types TypeScript puros de schemas
    pluginTs({
      output: { path: "./types" },
      // "string": campos `format: date`/`date-time` viram `string` no TS, casando
      // com o valor real na rede (o client, em src/api/client.ts, serializa
      // query params com `String(value)` — um `Date` nativo aqui viraria algo
      // como "Fri Jul 18 2026 00:00:00 GMT-0300", não "2026-07-18"). Mesma
      // config do futebol-web (mesmo backend) — ver kubb.config.ts de lá.
      dateType: "string",
      enumType: "asConst",
    }),

    // TanStack Query hooks
    pluginReactQuery({
      output: { path: "./hooks" },
      client: {
        importPath: "@/api/client",
        dataReturnType: "data",
      },
      query: {
        methods: ["get"],
        importPath: "@tanstack/react-query",
      },
      mutation: {
        methods: ["post", "put", "delete", "patch"],
      },
      group: {
        type: "tag",
        name: ({ group }) => `${group}Hooks`,
      },
    }),
  ],
}) satisfies Config;
