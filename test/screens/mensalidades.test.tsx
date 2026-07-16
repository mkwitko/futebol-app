import { screen, userEvent, waitFor } from "@testing-library/react-native";
import { useLocalSearchParams } from "expo-router";
import MensalidadesScreen from "@/app/group/[id]/mensalidades";
import { saveTokens } from "@/lib/auth/tokens";
import { FAKE_GROUP, FAKE_MEMBER, resetGroupsMocks, setDuesMock, setMembersMock } from "../mocks/handlers";
import { renderWithProviders } from "../utils/render";

jest.mock("expo-router", () => {
  const actual = jest.requireActual("expo-router");
  return {
    ...actual,
    useLocalSearchParams: jest.fn(() => ({ id: "group-1" })),
    useRouter: jest.fn(() => ({ back: jest.fn(), push: jest.fn(), replace: jest.fn() })),
  };
});

/** Mesmo cálculo de "YYYY-MM" usado pela tela (`currentCompetencyMonth`) — testes correm com `TZ=UTC`. */
function currentMonth(): string {
  const now = new Date();
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
}

const SELF_MEMBER = {
  ...FAKE_MEMBER,
  id: "member-self",
  billingMode: "mensalista" as const,
  player: { ...FAKE_MEMBER.player, id: "player-self", userId: "user-1", name: "Alice", phone: null },
};

const OTHER_MEMBER = {
  ...FAKE_MEMBER,
  id: "member-other",
  billingMode: "mensalista" as const,
  player: { ...FAKE_MEMBER.player, id: "player-other", userId: null, name: "Zico", phone: null },
};

describe("Mensalidades do grupo", () => {
  beforeEach(async () => {
    resetGroupsMocks();
    (useLocalSearchParams as jest.Mock).mockReturnValue({ id: "group-1" });
    setMembersMock(FAKE_GROUP.id, [SELF_MEMBER, OTHER_MEMBER]);
    setDuesMock(FAKE_GROUP.id, [
      {
        id: "due-self",
        groupId: FAKE_GROUP.id,
        groupMemberId: SELF_MEMBER.id,
        competencyMonth: currentMonth(),
        amountCents: 5000,
        status: "pending",
        paidConfirmedById: null,
        provider: "manual",
        externalRef: null,
        createdAt: "2026-07-01T00:00:00.000Z",
      },
      {
        id: "due-other",
        groupId: FAKE_GROUP.id,
        groupMemberId: OTHER_MEMBER.id,
        competencyMonth: currentMonth(),
        amountCents: 5000,
        status: "pending",
        paidConfirmedById: null,
        provider: "manual",
        externalRef: null,
        createdAt: "2026-07-01T00:00:00.000Z",
      },
    ]);
    // Loga `user-1` — dono do fixture `SELF_MEMBER` — pra exercitar o "Paguei".
    await saveTokens({ accessToken: "test-access-token", refreshToken: "test-refresh-token" });
  });

  it("lists this month's dues with member names and amounts", async () => {
    renderWithProviders(<MensalidadesScreen />);

    expect(await screen.findByText("Alice")).toBeOnTheScreen();
    expect(await screen.findByText("Zico")).toBeOnTheScreen();
    expect(screen.getAllByText("R$ 50,00").length).toBe(2);
    expect(screen.getAllByText("Pendente").length).toBe(2);
  });

  it("shows 'Paguei' only for the logged-in player's own due, and marks it paid", async () => {
    const user = userEvent.setup();
    renderWithProviders(<MensalidadesScreen />);

    expect(await screen.findByText("Alice")).toBeOnTheScreen();
    expect(screen.getAllByLabelText("Paguei").length).toBe(1);

    await user.press(screen.getByLabelText("Paguei"));

    await waitFor(() => {
      expect(screen.getAllByText("Pago").length).toBe(1);
    });
    expect(await screen.findByText("Mensalidade marcada como paga!")).toBeOnTheScreen();
  });

  it("lets the organizer confirm a pending due", async () => {
    const user = userEvent.setup();
    renderWithProviders(<MensalidadesScreen />);

    expect(await screen.findByText("Zico")).toBeOnTheScreen();
    const confirmCtas = screen.getAllByLabelText("Confirmar");
    expect(confirmCtas.length).toBe(2);

    await user.press(confirmCtas[0]!);

    await waitFor(() => {
      expect(screen.getAllByText("Pago").length).toBe(1);
    });
    expect(await screen.findByText("Mensalidade confirmada!")).toBeOnTheScreen();
  });
});
