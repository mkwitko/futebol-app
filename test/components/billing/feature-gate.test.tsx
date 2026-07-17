import { screen, waitFor } from "@testing-library/react-native";
import { Text } from "react-native";
import { FeatureGate } from "@/components/billing/feature-gate";
import { resetBillingMocks, setBillingMock } from "../../mocks/handlers";
import { renderWithProviders } from "../../utils/render";

jest.mock("expo-router", () => {
  const actual = jest.requireActual("expo-router");
  return { ...actual, useRouter: jest.fn(() => ({ push: jest.fn(), back: jest.fn() })) };
});

const child = <Text>Conteúdo premium</Text>;

describe("FeatureGate", () => {
  beforeEach(() => resetBillingMocks());

  it("renders children when the user has the feature", async () => {
    setBillingMock({ features: ["advanced_stats"] });
    renderWithProviders(<FeatureGate feature="advanced_stats">{child}</FeatureGate>);

    expect(await screen.findByText("Conteúdo premium")).toBeOnTheScreen();
    expect(screen.queryByTestId("upgrade-cta")).not.toBeOnTheScreen();
  });

  it("shows the upgrade CTA when the feature is missing and payments are enabled", async () => {
    setBillingMock({ features: [], paymentsEnabled: true });
    renderWithProviders(<FeatureGate feature="advanced_stats">{child}</FeatureGate>);

    expect(await screen.findByTestId("upgrade-cta")).toBeOnTheScreen();
    expect(screen.queryByText("Conteúdo premium")).not.toBeOnTheScreen();
  });

  it("renders nothing (no CTA) for a reviewer account (paymentsEnabled false)", async () => {
    setBillingMock({ features: [], paymentsEnabled: false });
    renderWithProviders(<FeatureGate feature="advanced_stats">{child}</FeatureGate>);

    // Give the query time to resolve, then assert both child and CTA stay hidden.
    await waitFor(() => {
      expect(screen.queryByTestId("upgrade-cta")).not.toBeOnTheScreen();
    });
    expect(screen.queryByText("Conteúdo premium")).not.toBeOnTheScreen();
  });
});
