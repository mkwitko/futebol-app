import { screen } from "@testing-library/react-native";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";
import { renderWithProviders } from "../../utils/render";

describe("GoogleSignInButton", () => {
  it("stays disabled with a coming-soon note when Google client IDs aren't configured", async () => {
    renderWithProviders(<GoogleSignInButton />);

    const button = await screen.findByTestId("google-sign-in-cta");
    expect(button.props.accessibilityState?.disabled).toBe(true);
    expect(screen.getByText("Login com Google em breve")).toBeOnTheScreen();
  });
});
