import { render, screen } from "@testing-library/react-native";
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
});
