import { screen, userEvent, waitFor } from "@testing-library/react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { http, HttpResponse } from "msw";
import EditMatchScreen from "@/app/match/[id]/edit";
import { env } from "@/env";
import { saveTokens } from "@/lib/auth/tokens";
import { FAKE_MATCH, resetGroupsMocks } from "../mocks/handlers";
import { server } from "../mocks/server";
import { renderWithProviders } from "../utils/render";

const mockBack = jest.fn();

jest.mock("expo-router", () => {
  const actual = jest.requireActual("expo-router");
  return {
    ...actual,
    useLocalSearchParams: jest.fn(() => ({ id: "match-1" })),
    useRouter: jest.fn(() => ({ back: mockBack, push: jest.fn(), replace: jest.fn() })),
  };
});

// FAKE_MATCH é o shape antigo (sem geo/modalidade) — a resposta real do
// GET /matches/:id inclui esses campos, então enriquecemos aqui.
const fullMatch = {
  ...FAKE_MATCH,
  modality: "campo" as const,
  latitude: -30.03,
  longitude: -51.21,
  city: "Porto Alegre",
  address: "Av. Ipiranga, 1000",
  seriesId: null as string | null,
  detached: false,
};

describe("Editar futebol", () => {
  beforeEach(async () => {
    resetGroupsMocks();
    mockBack.mockClear();
    (useLocalSearchParams as jest.Mock).mockReturnValue({ id: "match-1" });
    (useRouter as jest.Mock).mockReturnValue({ back: mockBack, push: jest.fn(), replace: jest.fn() });
    await saveTokens({ accessToken: "test-access-token", refreshToken: "test-refresh-token" });
    server.use(
      http.get(`${env.EXPO_PUBLIC_API_URL}/matches/:id`, () => HttpResponse.json(fullMatch)),
    );
  });

  it("pré-preenche os campos e salva as alterações (volta ao detalhe)", async () => {
    const user = userEvent.setup();
    renderWithProviders(<EditMatchScreen />);

    // Local pré-preenchido a partir da pelada carregada.
    expect(await screen.findByDisplayValue("Quadra do Zico")).toBeOnTheScreen();

    // Coords já vêm preenchidas → sem erro de geo → submit válido.
    await user.press(screen.getByTestId("edit-match-submit"));

    await waitFor(() => expect(mockBack).toHaveBeenCalledTimes(1));
  });

  it("avisa que editar desacopla quando a pelada faz parte de uma recorrência", async () => {
    server.use(
      http.get(`${env.EXPO_PUBLIC_API_URL}/matches/:id`, () =>
        HttpResponse.json({ ...fullMatch, seriesId: "series-1", detached: false }),
      ),
    );

    renderWithProviders(<EditMatchScreen />);

    expect(await screen.findByTestId("edit-match-series-note")).toBeOnTheScreen();
  });
});
