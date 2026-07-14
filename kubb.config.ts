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
      dateType: "date",
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
