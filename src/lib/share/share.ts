// `expo-file-system` (SDK 54+) exporta a API nova baseada em classes
// (`File`/`Directory`/`Paths`), sem `downloadAsync`/`cacheDirectory`. O
// subpath `/legacy` mantém a API clássica baseada em URI de string, que é o
// que precisamos aqui (baixar um PNG remoto pra um caminho de cache).
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import { Share } from "react-native";
import { buildOgImageUrl, buildShareUrl, type ShareSubject } from "@/lib/player/url";

/** Modo link: share sheet nativo com a URL `/j/:slug` (preview via OG). */
export async function shareLink(slug: string, subject: ShareSubject, message: string): Promise<void> {
  const url = buildShareUrl(slug, subject);
  // iOS usa `url`; Android concatena no `message`. Passar ambos cobre os dois.
  await Share.share({ url, message: message ? `${message} ${url}` : url });
}

/** Modo imagem: baixa o PNG do backend e entrega pro share sheet (IG/galeria). */
export async function shareImage(slug: string, subject: ShareSubject): Promise<void> {
  const remote = buildOgImageUrl(slug, subject);
  const dest = `${FileSystem.cacheDirectory}share-${slug}-${subject.kind}.png`;
  await FileSystem.downloadAsync(remote, dest);
  if (!(await Sharing.isAvailableAsync())) {
    // Fallback: sem share de arquivo, compartilha o link.
    await shareLink(slug, subject, "");
    return;
  }
  await Sharing.shareAsync(dest, { mimeType: "image/png", dialogTitle: "Camisa7" });
}
