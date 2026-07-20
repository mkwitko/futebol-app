import { fireEvent, screen } from "@testing-library/react-native";
import { ShareSheet } from "@/components/share/share-sheet";
import * as shareLib from "@/lib/share/share";
import { renderWithProviders } from "../utils/render";

jest.mock("@/lib/share/share", () => ({
  shareLink: jest.fn(async () => undefined),
  shareImage: jest.fn(async () => undefined),
}));

describe("ShareSheet", () => {
  const base = { visible: true, onClose: jest.fn(), slug: "mauricio-9f3a", message: "msg" };
  beforeEach(() => jest.clearAllMocks());

  it("triggers shareLink on the link action", async () => {
    renderWithProviders(<ShareSheet {...base} subject={{ kind: "carta" }} />);
    fireEvent.press(screen.getByText("Compartilhar link"));
    expect(shareLib.shareLink).toHaveBeenCalledWith("mauricio-9f3a", { kind: "carta" }, "msg");
  });

  it("triggers shareImage on the image action", async () => {
    renderWithProviders(<ShareSheet {...base} subject={{ kind: "carta" }} />);
    fireEvent.press(screen.getByText("Salvar imagem"));
    expect(shareLib.shareImage).toHaveBeenCalledWith("mauricio-9f3a", { kind: "carta" });
  });
});
