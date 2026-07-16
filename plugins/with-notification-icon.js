const fs = require("node:fs");
const path = require("node:path");
const {
  AndroidConfig,
  withAndroidColors,
  withAndroidManifest,
  withDangerousMod,
} = require("expo/config-plugins");

/**
 * Config plugin (local): ícone + cor da notificação Android.
 *
 * Android 8+ exige um ícone de notificação branco/transparente dedicado —
 * sem ele o SO mostra um quadrado branco pra notificação exibida a partir do
 * bloco `notification` do FCM (background/quit). Reusamos o asset
 * monocromático do adaptive icon (já é silhueta branca com alpha) como
 * `@drawable/notification_icon`, e apontamos os meta-data padrão do FCM
 * (`default_notification_icon` / `default_notification_color`) pra ele.
 *
 * O `smallIcon` do notifee (foreground, em notifications.ts) usa o mesmo
 * nome `notification_icon` pra bater visualmente.
 *
 * Só é aplicado com push ligado (ver app.config.ts / PUSH_ENABLED).
 */

const ICON_RES_NAME = "notification_icon";
const COLOR_RES_NAME = "notification_icon_color";
const SOURCE_ICON = "assets/android-icon-monochrome.png";

function withNotificationIconAsset(config) {
  return withDangerousMod(config, [
    "android",
    (cfg) => {
      const src = path.join(cfg.modRequest.projectRoot, SOURCE_ICON);
      const drawableDir = path.join(
        cfg.modRequest.platformProjectRoot,
        "app/src/main/res/drawable",
      );
      fs.mkdirSync(drawableDir, { recursive: true });
      fs.copyFileSync(src, path.join(drawableDir, `${ICON_RES_NAME}.png`));
      return cfg;
    },
  ]);
}

function withNotificationManifestMeta(config) {
  return withAndroidManifest(config, (cfg) => {
    const app = AndroidConfig.Manifest.getMainApplicationOrThrow(cfg.modResults);
    AndroidConfig.Manifest.addMetaDataItemToMainApplication(
      app,
      "com.google.firebase.messaging.default_notification_icon",
      `@drawable/${ICON_RES_NAME}`,
      "resource",
    );
    AndroidConfig.Manifest.addMetaDataItemToMainApplication(
      app,
      "com.google.firebase.messaging.default_notification_color",
      `@color/${COLOR_RES_NAME}`,
      "resource",
    );
    return cfg;
  });
}

function withNotificationColor(config, color) {
  return withAndroidColors(config, (cfg) => {
    cfg.modResults = AndroidConfig.Colors.assignColorValue(cfg.modResults, {
      name: COLOR_RES_NAME,
      value: color,
    });
    return cfg;
  });
}

/** @param {{ color?: string }} [props] cor de destaque da notificação (default = primary do tema). */
module.exports = function withNotificationIcon(config, props = {}) {
  const color = props.color ?? "#21C776";
  config = withNotificationIconAsset(config);
  config = withNotificationColor(config, color);
  config = withNotificationManifestMeta(config);
  return config;
};
