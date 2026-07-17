import { screen, userEvent, waitFor } from "@testing-library/react-native";
import * as WebBrowser from "expo-web-browser";
import PlanosScreen from "@/app/(drawer)/planos";
import { resetBillingMocks, setBillingMock } from "../mocks/handlers";
import { renderWithProviders } from "../utils/render";

const mockBack = jest.fn();
const mockPush = jest.fn();

jest.mock("expo-router", () => {
  const actual = jest.requireActual("expo-router");
  return {
    ...actual,
    useRouter: jest.fn(() => ({ back: mockBack, push: mockPush, canGoBack: () => true })),
  };
});

describe("Tela de planos", () => {
  beforeEach(() => {
    resetBillingMocks();
    mockBack.mockClear();
    mockPush.mockClear();
    (WebBrowser.openBrowserAsync as jest.Mock).mockClear();
  });

  it("lists plans and opens the Stripe checkout url on subscribe", async () => {
    const user = userEvent.setup();
    renderWithProviders(<PlanosScreen />);

    expect(await screen.findByText("Plano Organizador")).toBeOnTheScreen();
    expect(screen.getByText("Plano Jogador")).toBeOnTheScreen();

    await user.press(screen.getByTestId("plan-subscribe-organizer"));

    await waitFor(() => {
      expect(WebBrowser.openBrowserAsync).toHaveBeenCalledWith(
        "https://checkout.stripe.test/session",
      );
    });
  });

  it("opens the billing portal on manage", async () => {
    const user = userEvent.setup();
    renderWithProviders(<PlanosScreen />);

    await user.press(await screen.findByTestId("billing-manage"));

    await waitFor(() => {
      expect(WebBrowser.openBrowserAsync).toHaveBeenCalledWith(
        "https://portal.stripe.test/session",
      );
    });
  });

  it("hides all payment UI and navigates back for a reviewer account (paymentsEnabled false)", async () => {
    setBillingMock({ paymentsEnabled: false });
    renderWithProviders(<PlanosScreen />);

    await waitFor(() => {
      expect(mockBack).toHaveBeenCalled();
    });

    expect(screen.queryByText("Plano Organizador")).not.toBeOnTheScreen();
    expect(screen.queryByTestId("billing-manage")).not.toBeOnTheScreen();
    expect(WebBrowser.openBrowserAsync).not.toHaveBeenCalled();
  });
});
