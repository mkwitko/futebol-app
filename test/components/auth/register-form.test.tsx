import { render, screen, userEvent, waitFor } from "@testing-library/react-native";
import { RegisterForm } from "@/components/auth/register-form";

describe("RegisterForm", () => {
  it("submits with the default role (jogador) when nothing else is picked", async () => {
    const onSubmit = jest.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();
    render(<RegisterForm onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText("Nome"), "Bianca");
    await user.type(screen.getByLabelText("E-mail"), "bianca@futebol.app");
    await user.type(screen.getByLabelText("Senha"), "supersecret");
    await user.type(screen.getByLabelText("Confirmar senha"), "supersecret");
    await user.press(screen.getByRole("button", { name: "Criar conta" }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "Bianca",
        email: "bianca@futebol.app",
        roles: ["jogador"],
      }),
    );
  });

  it("includes extra selected roles and shows the quadra web-management note", async () => {
    const onSubmit = jest.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();
    render(<RegisterForm onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText("Nome"), "Bianca");
    await user.type(screen.getByLabelText("E-mail"), "bianca@futebol.app");
    await user.type(screen.getByLabelText("Senha"), "supersecret");
    await user.type(screen.getByLabelText("Confirmar senha"), "supersecret");
    await user.press(screen.getByTestId("register-role-quadra"));

    expect(screen.getByTestId("register-role-quadra-note")).toBeOnTheScreen();

    await user.press(screen.getByRole("button", { name: "Criar conta" }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit.mock.calls[0]![0].roles).toEqual(["jogador", "quadra"]);
  });
});
