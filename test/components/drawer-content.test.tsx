import type { ReactNode } from "react";
import type { DrawerContentComponentProps } from "expo-router/drawer";
import { screen, waitFor } from "@testing-library/react-native";
import { DrawerAppContent } from "@/components/layout/drawer-content";
import { saveTokens } from "@/lib/auth/tokens";
import { renderWithProviders } from "../utils/render";

jest.mock("expo-router", () => {
  const actual = jest.requireActual("expo-router");
  return { ...actual, useRouter: jest.fn(() => ({ push: jest.fn(), back: jest.fn() })) };
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

const fakeProps = { navigation: { closeDrawer: jest.fn() } } as unknown as DrawerContentComponentProps;

describe("DrawerAppContent banner", () => {
  beforeEach(async () => {
    await saveTokens({ accessToken: "test-access-token", refreshToken: "test-refresh-token" });
  });

  it("shows the player's name, overall and best-position abbreviation", async () => {
    renderWithProviders(<DrawerAppContent {...fakeProps} />);

    expect(await screen.findByText("Alice")).toBeOnTheScreen();
    await waitFor(() => expect(screen.getByText("84")).toBeOnTheScreen());
    expect(screen.getByText("ATA")).toBeOnTheScreen();
  });
});
