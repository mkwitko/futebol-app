import { render, screen, userEvent } from "@testing-library/react-native";
import { Input } from "@/components/ui/input";

describe("Input", () => {
  it("renders the label and forwards it as the accessible name", () => {
    render(<Input label="E-mail" value="" onChangeText={jest.fn()} />);

    expect(screen.getByLabelText("E-mail")).toBeOnTheScreen();
  });

  it("shows the error message when provided", () => {
    render(
      <Input
        label="E-mail"
        value=""
        onChangeText={jest.fn()}
        error="Informe um e-mail válido."
      />,
    );

    expect(screen.getByText("Informe um e-mail válido.")).toBeOnTheScreen();
    expect(screen.getByRole("alert")).toHaveTextContent("Informe um e-mail válido.");
  });

  it("hides the error message when there is none", () => {
    render(<Input label="E-mail" value="" onChangeText={jest.fn()} />);

    expect(screen.queryByRole("alert")).not.toBeOnTheScreen();
  });

  it("toggles password visibility when secureToggle is set", async () => {
    const user = userEvent.setup();
    render(<Input label="Senha" secureToggle value="" onChangeText={jest.fn()} />);

    const field = screen.getByLabelText("Senha");
    expect(field.props.secureTextEntry).toBe(true);

    await user.press(screen.getByLabelText("Mostrar senha"));
    expect(field.props.secureTextEntry).toBe(false);

    await user.press(screen.getByLabelText("Ocultar senha"));
    expect(field.props.secureTextEntry).toBe(true);
  });
});
