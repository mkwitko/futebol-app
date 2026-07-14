/** @type {import('jest').Config} */
module.exports = {
  preset: "jest-expo",
  setupFilesAfterEnv: ["<rootDir>/test/setup.ts"],
  // MSW publica exports condicionais que colidem com a condição "react-native"
  // usada pelo ambiente de teste do jest-expo (o campo "exports" do msw marca
  // "react-native" como null para o subpath "/node"). Isso força a resolução
  // padrão (Node "require"), como recomendado pela doc do MSW para Jest.
  testEnvironmentOptions: {
    customExportConditions: [""],
  },
  // MSW e suas dependências transitivas publicam ESM puro (sem build CJS) —
  // precisam ser transformadas pelo Babel. O `.*` antes do grupo lida com o
  // layout aninhado do pnpm (node_modules/.pnpm/<pkg>@<versão>/node_modules/<pkg>).
  transformIgnorePatterns: [
    "node_modules/(?!.*(react-native[a-z0-9-]*|@react-native[a-z0-9/-]*|expo[a-z0-9-]*|@expo[a-z0-9/-]*|nativewind|msw|@mswjs|rettime|@bundled-es-modules|strict-event-emitter|outvariant|headers-polyfill|is-node-process|@open-draft|until-async|graphql|standard-navigation)/)",
  ],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  collectCoverageFrom: [
    "src/**/*.{ts,tsx}",
    "!src/api/generated/**",
    "!src/**/*.d.ts",
  ],
};
