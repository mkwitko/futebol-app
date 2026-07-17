import { fireEvent, screen } from "@testing-library/react-native";
import DescobrirScreen from "@/app/(drawer)/descobrir";
import { resetGroupsMocks, setDiscoverMock } from "../mocks/handlers";
import { renderWithProviders } from "../utils/render";

// Override do stub global de react-native-maps (test/setup.ts) só neste arquivo:
// aqui o MapView renderiza os filhos e o Marker vira um Pressable, pra podermos
// tocar num marcador e abrir o card inferior.
jest.mock("react-native-maps", () => {
  const React = require("react");
  const { Pressable, View } = require("react-native");
  const MapView = ({ children, testID }: { children?: unknown; testID?: string }) => (
    <View testID={testID}>{children}</View>
  );
  const Marker = ({ onPress, testID }: { onPress?: () => void; testID?: string }) => (
    <Pressable testID={testID} onPress={onPress} />
  );
  return { __esModule: true, default: MapView, Marker };
});

jest.mock("expo-router", () => {
  const actual = jest.requireActual("expo-router");
  return { ...actual, useRouter: jest.fn(() => ({ push: jest.fn(), back: jest.fn() })) };
});

const OPEN_MATCH = {
  matchId: "match-open",
  groupId: "group-1",
  groupName: "Pelada do Parque",
  datetime: "2026-07-20T21:00:00.000Z",
  location: "Quadra Central",
  address: "Rua X, 100",
  city: "Porto Alegre",
  latitude: -30.03,
  longitude: -51.22,
  priceCents: 2500,
  slots: 10,
  confirmedCount: 4,
  distanceKm: 1.2,
  modality: "society" as const,
  joinPolicy: "open" as const,
  full: false,
};

const REQUEST_MATCH = {
  ...OPEN_MATCH,
  matchId: "match-request",
  groupName: "Pelada Fechada",
  joinPolicy: "request" as const,
  full: false,
};

describe("DescobrirScreen", () => {
  beforeEach(() => {
    resetGroupsMocks();
  });

  it("resolve a localização e mostra os filtros de raio", async () => {
    setDiscoverMock([OPEN_MATCH]);
    renderWithProviders(<DescobrirScreen />);

    // Depois de resolver as coords (mock concede permissão), os chips de raio aparecem.
    expect(await screen.findByTestId("discover-radius-10")).toBeOnTheScreen();
    expect(screen.getByTestId("discover-map")).toBeOnTheScreen();
  });

  it("abre o card ao tocar no marcador e mostra o botão Entrar (open)", async () => {
    setDiscoverMock([OPEN_MATCH]);
    renderWithProviders(<DescobrirScreen />);

    fireEvent.press(await screen.findByTestId("discover-marker-match-open"));

    expect(await screen.findByTestId("discover-card")).toBeOnTheScreen();
    expect(screen.getByText("Pelada do Parque")).toBeOnTheScreen();
    expect(screen.getByText("4/10 confirmados")).toBeOnTheScreen();
    expect(screen.getByRole("button", { name: "Entrar" })).toBeOnTheScreen();
  });

  it("mostra 'Pedir pra entrar' e confirma o envio (request)", async () => {
    setDiscoverMock([REQUEST_MATCH]);
    renderWithProviders(<DescobrirScreen />);

    fireEvent.press(await screen.findByTestId("discover-marker-match-request"));
    fireEvent.press(await screen.findByTestId("discover-join"));

    expect(await screen.findByText("Pedido enviado! O organizador vai avaliar.")).toBeOnTheScreen();
  });

  it("mostra estado vazio quando não há peladas no raio", async () => {
    setDiscoverMock([]);
    renderWithProviders(<DescobrirScreen />);

    expect(
      await screen.findByText("Nenhuma pelada pública encontrada por aqui. Tente aumentar o raio."),
    ).toBeOnTheScreen();
  });
});
