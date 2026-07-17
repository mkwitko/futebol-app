import { screen, userEvent, waitFor } from "@testing-library/react-native";
import SignInScreen from "@/app/(auth)/sign-in";
import { renderWithProviders } from "../utils/render";

describe("SignInScreen", () => {
  it("renders the sign-in form", async () => {
    renderWithProviders(<SignInScreen />);

    expect(await screen.findByText("Entre para organizar suas partidas.")).toBeOnTheScreen();
    expect(screen.getByLabelText("E-mail")).toBeOnTheScreen();
    expect(screen.getByLabelText("Senha")).toBeOnTheScreen();
    expect(screen.getByRole("button", { name: "Entrar" })).toBeOnTheScreen();
  });

  it("shows validation errors when submitting empty fields", async () => {
    const user = userEvent.setup();
    renderWithProviders(<SignInScreen />);

    await user.press(screen.getByRole("button", { name: "Entrar" }));

    expect(await screen.findAllByText("Campo obrigatório.")).not.toHaveLength(0);
  });

  it("logs in successfully with valid credentials (MSW)", async () => {
    const user = userEvent.setup();
    renderWithProviders(<SignInScreen />);

    await user.type(screen.getByLabelText("E-mail"), "alice@futebol.app");
    await user.type(screen.getByLabelText("Senha"), "correct-password");
    await user.press(screen.getByRole("button", { name: "Entrar" }));

    await waitFor(() => {
      expect(screen.queryByText("E-mail ou senha inválidos.")).not.toBeOnTheScreen();
    });
  });
});
