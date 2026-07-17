const { withProjectBuildGradle } = require("expo/config-plugins");

/**
 * Config plugin (local): registra o maven repo local do Notifee no
 * `android/build.gradle` (allprojects.repositories).
 *
 * O Notifee publica seu AAR `app.notifee:core` como um maven repo dentro de
 * `node_modules/@notifee/react-native/android/libs`. O próprio build.gradle do
 * módulo adiciona esse repo, mas via `rootProject.allprojects {}` de forma
 * preguiçosa — e o Expo CLI roda o Gradle com `--configure-on-demand`, então o
 * projeto `:app` resolve o classpath ANTES do módulo notifee ser configurado.
 * Resultado: `Could not find any matches for app.notifee:core:+`.
 *
 * Declarando o repo direto no root build.gradle ele existe independente da
 * ordem de configuração.
 */

const MARKER = "@notifee/react-native/android/libs";
const REPO_LINE =
  '    maven { url "$rootDir/../node_modules/@notifee/react-native/android/libs" } // notifee core AAR (with-notifee-repo plugin)';

module.exports = function withNotifeeRepo(config) {
  return withProjectBuildGradle(config, (cfg) => {
    if (cfg.modResults.language !== "groovy") {
      throw new Error(
        "with-notifee-repo: build.gradle não é Groovy; não sei injetar o repo.",
      );
    }
    let contents = cfg.modResults.contents;
    if (contents.includes(MARKER)) {
      return cfg; // idempotente
    }
    // Insere logo após a primeira `mavenCentral()` dentro de allprojects.
    const anchor = /allprojects\s*\{\s*repositories\s*\{[^}]*?mavenCentral\(\)/;
    const match = contents.match(anchor);
    if (!match) {
      throw new Error(
        "with-notifee-repo: não achei allprojects { repositories { ... mavenCentral() } } no build.gradle.",
      );
    }
    const insertAt = match.index + match[0].length;
    contents =
      contents.slice(0, insertAt) +
      "\n" +
      REPO_LINE +
      contents.slice(insertAt);
    cfg.modResults.contents = contents;
    return cfg;
  });
};
