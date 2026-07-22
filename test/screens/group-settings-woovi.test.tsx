import type { ReactNode } from "react";
import { screen, userEvent, waitFor } from "@testing-library/react-native";
import { useLocalSearchParams } from "expo-router";
import { GroupSettingsSheet } from "@/components/groups/group-settings-sheet";
import GroupDetailScreen from "@/app/group/[id]";
import { resetBillingMocks, resetGroupsMocks, setBillingMock, setPaymentsConfigMock } from "../mocks/handlers";
import { renderWithProviders } from "../utils/render";

jest.mock("expo-router", () => {
  const actual = jest.requireActual("expo-router");
  return {
    ...actual,
    useRouter: jest.fn(() => ({ push: jest.fn(), back: jest.fn() })),
    useLocalSearchParams: jest.fn(() => ({ id: "group-1" })),
  };
});

jest.mock("@/hooks/auth/use-auth", () => ({
  useAuth: () => ({
    user: { id: "user-1", name: "Alice", email: "alice@futebol.app" },
    isLoading: false,
    isAuthenticated: true,
  }),
  AuthProvider: function AuthProvider({ children }: { children: ReactNode }) {
    return children;
  },
}));

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

  // Regressão do bug de prefill: `wooviPixKey` chegando depois do mount (ex.:
  // `useGetGroup` ainda pendente na primeira renderização do sheet) precisa
  // re-semear o rascunho — antes do fix, `useState(wooviPixKey ?? "")` só
  // seedava na montagem e ignorava a chegada assíncrona do valor real.
  it("re-semeia a chave PIX quando ela chega depois do mount (assíncrono)", async () => {
    const { rerender } = renderWithProviders(
      <GroupSettingsSheet {...baseProps} isOwner wooviPixKey={null} />,
    );

    expect((await screen.findByTestId("group-woovi-pixkey")).props.value).toBe("");

    rerender(<GroupSettingsSheet {...baseProps} isOwner wooviPixKey="chegou-depois@pix.com" />);

    await waitFor(() => {
      expect(screen.getByTestId("group-woovi-pixkey").props.value).toBe("chegou-depois@pix.com");
    });
  });
});

describe("GroupDetailScreen — groupId chega no GroupSettingsSheet pelo call site real", () => {
  beforeEach(() => {
    resetGroupsMocks();
    resetBillingMocks();
    setBillingMock({ paymentsEnabled: true });
    setPaymentsConfigMock({ enabled: true });
    (useLocalSearchParams as jest.Mock).mockReturnValue({ id: "group-1" });
  });

  // Cobre o bug crítico do Task 11: `group/[id].tsx` renderizava
  // `<GroupSettingsSheet>` sem `groupId`/`wooviPixKey`, e o gate
  // `isOwner && paymentsEnabled && groupId` nunca liberava a seção de PIX —
  // feature morta em produção mesmo com o componente/hook testados
  // isoladamente. Este teste sobe a tela real (não só o sheet) pra pegar
  // exatamente essa falha de wiring no call site.
  it("mostra o campo de chave PIX ao abrir as configurações como dono do grupo", async () => {
    const user = userEvent.setup();
    renderWithProviders(<GroupDetailScreen />);

    await user.press(await screen.findByTestId("group-settings-cta"));

    expect(await screen.findByTestId("group-woovi-pixkey")).toBeOnTheScreen();
  });
});
