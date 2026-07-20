import { buildOgImageUrl, buildShareUrl } from "@/lib/player/url";
import { Share } from "react-native";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system/legacy";
import { shareImage, shareLink } from "@/lib/share/share";

jest.mock("expo-sharing", () => ({
  isAvailableAsync: jest.fn(async () => true),
  shareAsync: jest.fn(async () => undefined),
}));
// `share.ts` importa a API legada (`expo-file-system/legacy`) — ver comentário
// lá. Mockamos o mesmo subpath aqui.
jest.mock("expo-file-system/legacy", () => ({
  cacheDirectory: "file:///cache/",
  downloadAsync: jest.fn(async (_url: string, dest: string) => ({ uri: dest, status: 200 })),
}));

// EXPO_PUBLIC_API_URL default in tests is http://localhost:3333
describe("buildShareUrl", () => {
  it("builds the carta link", () => {
    expect(buildShareUrl("mauricio-9f3a", { kind: "carta" })).toBe(
      "http://localhost:3333/j/mauricio-9f3a",
    );
  });
  it("adds ?a= for a conquista", () => {
    expect(buildShareUrl("mauricio-9f3a", { kind: "conquista", key: "hat_trick" })).toBe(
      "http://localhost:3333/j/mauricio-9f3a?a=hat_trick",
    );
  });
  it("adds ?r= for a ranking", () => {
    expect(buildShareUrl("mauricio-9f3a", { kind: "ranking", groupId: "g1", playerId: "p1" })).toBe(
      "http://localhost:3333/j/mauricio-9f3a?r=g1",
    );
  });
});

describe("buildOgImageUrl", () => {
  it("points to the right PNG endpoint per subject", () => {
    expect(buildOgImageUrl("mauricio-9f3a", { kind: "carta" })).toBe(
      "http://localhost:3333/og/carta/mauricio-9f3a.png",
    );
    expect(buildOgImageUrl("mauricio-9f3a", { kind: "conquista", key: "hat_trick" })).toBe(
      "http://localhost:3333/og/conquista/mauricio-9f3a/hat_trick.png",
    );
    expect(buildOgImageUrl("x", { kind: "ranking", groupId: "g1", playerId: "p1" })).toBe(
      "http://localhost:3333/og/ranking/g1/p1.png",
    );
  });
});

describe("shareLink", () => {
  it("calls RN Share with the smart URL and message", async () => {
    const spy = jest.spyOn(Share, "share").mockResolvedValue({ action: "sharedAction" } as never);
    await shareLink("mauricio-9f3a", { kind: "carta" }, "Minha carta 👇");
    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({ url: "http://localhost:3333/j/mauricio-9f3a", message: expect.stringContaining("Minha carta") }),
    );
    spy.mockRestore();
  });
});

describe("shareImage", () => {
  it("downloads the PNG and hands it to expo-sharing", async () => {
    await shareImage("mauricio-9f3a", { kind: "carta" });
    expect(FileSystem.downloadAsync).toHaveBeenCalledWith(
      "http://localhost:3333/og/carta/mauricio-9f3a.png",
      expect.stringContaining("file:///cache/"),
    );
    expect(Sharing.shareAsync).toHaveBeenCalledWith(
      expect.stringContaining("file:///cache/"),
      expect.objectContaining({ mimeType: "image/png" }),
    );
  });
});
