import { screen, userEvent, waitFor } from "@testing-library/react-native";
import { GroupSettingsSheet } from "@/components/groups/group-settings-sheet";
import { resetBillingMocks, setBillingMock, setPaymentsConfigMock } from "../mocks/handlers";
import { renderWithProviders } from "../utils/render";

jest.mock("expo-router", () => {
  const actual = jest.requireActual("expo-router");
  return { ...actual, useRouter: jest.fn(() => ({ push: jest.fn(), back: jest.fn() })) };
});

const baseProps = {
  visible: true,
  onClose: jest.fn(),
  groupName: "Pelada dos Amigos",
  monthlyFeeCents: null,
  onSaveFee: jest.fn(async () => {}),
  groupId: "group-1",
};

describe("GroupSettingsSheet — chave PIX (Woovi)", () => {
  beforeEach(() => {
    resetBillingMocks();
    setBillingMock({ paymentsEnabled: true });
    setPaymentsConfigMock({ enabled: true });
  });

  it("mostra o campo de chave PIX pro dono quando pagamentos estão habilitados", async () => {
    renderWithProviders(<GroupSettingsSheet {...baseProps} isOwner wooviPixKey={null} />);

    expect(await screen.findByTestId("group-woovi-pixkey")).toBeOnTheScreen();
  });

  it("salva a chave PIX e mostra sucesso", async () => {
    const user = userEvent.setup();
    renderWithProviders(<GroupSettingsSheet {...baseProps} isOwner wooviPixKey={null} />);

    const input = await screen.findByTestId("group-woovi-pixkey");
    await user.type(input, "organizador@pix.com");
    await user.press(screen.getByTestId("group-woovi-pixkey-save"));

    await waitFor(() => {
      expect(screen.getByText("Chave PIX salva!")).toBeOnTheScreen();
    });
  });

  it("prefila a chave PIX já cadastrada", async () => {
    renderWithProviders(<GroupSettingsSheet {...baseProps} isOwner wooviPixKey="ja-cadastrada@pix.com" />);

    const input = await screen.findByTestId("group-woovi-pixkey");
    expect(input.props.value).toBe("ja-cadastrada@pix.com");
  });

  it("não mostra o campo quando pagamentos estão desabilitados", async () => {
    setPaymentsConfigMock({ enabled: false });
    renderWithProviders(<GroupSettingsSheet {...baseProps} isOwner wooviPixKey={null} />);

    await waitFor(() => {
      expect(screen.queryByTestId("group-woovi-pixkey")).not.toBeOnTheScreen();
    });
  });

  it("não mostra o campo pra quem não é dono", async () => {
    renderWithProviders(<GroupSettingsSheet {...baseProps} isOwner={false} wooviPixKey={null} />);

    await waitFor(() => {
      expect(screen.queryByTestId("group-woovi-pixkey")).not.toBeOnTheScreen();
    });
  });
});
