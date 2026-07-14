const expoConfig = require("eslint-config-expo/flat");
const { defineConfig } = require("eslint/config");

module.exports = defineConfig([
  expoConfig,
  {
    ignores: [
      "dist/**",
      "src/api/generated/**", // gerado pelo Kubb — não editar/lintar manualmente
      ".expo/**",
      "node_modules/**",
    ],
  },
  {
    files: ["__mocks__/**", "test/**", "jest.config.js"],
    languageOptions: {
      globals: { jest: "readonly" },
    },
  },
]);
