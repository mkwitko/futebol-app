import type { ReactNode } from "react";
import type { DrawerContentComponentProps } from "expo-router/drawer";
import { fireEvent, screen, waitFor } from "@testing-library/react-native";
import { useRouter } from "expo-router";
import { http } from "msw";
import { DrawerAppContent } from "@/components/layout/drawer-content";
import { saveTokens } from "@/lib/auth/tokens";
import { env } from "@/env";
import { FAKE_MY_PLAYER, resetGroupsMocks, setMyPlayerMock } from "../mocks/handlers";
import { server } from "../mocks/server";
import { renderWithProviders } from "../utils/render";

// Hoisted so tests can assert on the same instance the mocked `useRouter()` returns —
// referencing a module-scope `mock`-prefixed const from inside `jest.mock()`'s factory
// is allowed by jest's out-of-scope-variable guard (see create-match.test.tsx for the
// same pattern).
const mockPush = jest.fn();

jest.mock("expo-router", () => {
  const actual = jest.requireActual("expo-router");
  return { ...actual, useRouter: jest.fn(() => ({ push: mockPush, back: jest.fn() })) };
});

// DrawerItemList reaches into navigation internals; stub it — this test covers the banner.
// Note: uses JSX (not React.createElement) — nativewind's babel plugin rewrites
// `React.createElement` calls into a module-scope helper reference, which jest's
// out-of-scope-variable guard rejects inside a jest.mock() factory.
jest.mock("expo-router/drawer", () => {
  const { View } = require("react-native");
  return {
    DrawerContentScrollView: ({ children }: { children?: ReactNode }) => (
      <View>{children}</View>
    ),
    DrawerItemList: () => null,
  };
});

// `useSafeAreaInsets` exige um `SafeAreaProvider` em runtime; sem ele o hook
// lança. Mocka só neste teste (o mock oficial da lib é global demais e quebra
// as telas que usam `SafeAreaView` com fallback) retornando insets zerados.
jest.mock("react-native-safe-area-context", () => {
  const actual = jest.requireActual("react-native-safe-area-context");
  return {
    ...actual,
    useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
  };
});

const closeDrawer = jest.fn();
const fakeProps = { navigation: { closeDrawer } } as unknown as DrawerContentComponentProps;

describe("DrawerAppContent banner", () => {
  beforeEach(async () => {
    resetGroupsMocks();
    mockPush.mockClear();
    closeDrawer.mockClear();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush, back: jest.fn() });
    await saveTokens({ accessToken: "test-access-token", refreshToken: "test-refresh-token" });
  });

  it("shows the player's name, overall and best-position abbreviation", async () => {
    renderWithProviders(<DrawerAppContent {...fakeProps} />);

    expect(await screen.findByText("Alice")).toBeOnTheScreen();
    await waitFor(() => expect(screen.getByText("84")).toBeOnTheScreen());
    expect(screen.getByText("ATA")).toBeOnTheScreen();
  });

  it("closes the drawer and navigates to /perfil when the banner is pressed", async () => {
    renderWithProviders(<DrawerAppContent {...fakeProps} />);

    const banner = await screen.findByTestId("drawer-banner");
    fireEvent.press(banner);

    expect(closeDrawer).toHaveBeenCalledTimes(1);
    expect(mockPush).toHaveBeenCalledWith("/perfil");
  });

  it("renders the loading skeleton while the player is pending, not the name/overall", async () => {
    // Handler never resolves — `useGetMyPlayer` stays `isPending` for the life of the test.
    server.use(http.get(`${env.EXPO_PUBLIC_API_URL}/players/me`, () => new Promise(() => {})));

    renderWithProviders(<DrawerAppContent {...fakeProps} />);

    expect(await screen.findByTestId("drawer-banner-skeleton")).toBeOnTheScreen();
    expect(screen.queryByText("Alice")).not.toBeOnTheScreen();
    expect(screen.queryByText("84")).not.toBeOnTheScreen();
  });

  it("hides the overall pill when the player's generalOverall is null", async () => {
    setMyPlayerMock({
      ...FAKE_MY_PLAYER,
      generalOverall: null,
      overallByPosition: {},
    } as unknown as typeof FAKE_MY_PLAYER);

    renderWithProviders(<DrawerAppContent {...fakeProps} />);

    expect(await screen.findByText("Alice")).toBeOnTheScreen();
    expect(screen.queryByText("84")).toBeNull();
  });
});

describe("DrawerAppContent sign-out", () => {
  beforeEach(async () => {
    resetGroupsMocks();
    (useRouter as jest.Mock).mockReturnValue({ push: jest.fn(), back: jest.fn() });
    await saveTokens({ accessToken: "test-access-token", refreshToken: "test-refresh-token" });
  });

  it("mostra o botão de sair na sidebar", async () => {
    renderWithProviders(<DrawerAppContent {...fakeProps} />);
    expect(await screen.findByTestId("drawer-sign-out")).toBeOnTheScreen();
  });

  it("pede confirmação antes de sair (não sai direto)", async () => {
    renderWithProviders(<DrawerAppContent {...fakeProps} />);

    fireEvent.press(await screen.findByTestId("drawer-sign-out"));

    // O diálogo de confirmação aparece com título + pergunta.
    expect(await screen.findByText("Sair da conta")).toBeOnTheScreen();
    expect(screen.getByText("Tem certeza que deseja sair da sua conta?")).toBeOnTheScreen();
  });
});

describe("DrawerAppContent without auth", () => {
  it("does not show the overall pill when there is no authenticated user", async () => {
    // no saveTokens here → useAuth().user is null → query disabled
    renderWithProviders(<DrawerAppContent {...fakeProps} />);
    // Give any (disabled) query a tick; the pill must never appear.
    await waitFor(() => expect(screen.queryByText("84")).toBeNull());
  });
});
