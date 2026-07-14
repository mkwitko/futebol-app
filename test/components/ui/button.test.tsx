import { render, screen, userEvent } from "@testing-library/react-native";
import { Button } from "@/components/ui/button";

describe("Button", () => {
  it("fires onPress when tapped", async () => {
    const onPress = jest.fn();
    const user = userEvent.setup();
    render(<Button onPress={onPress}>Confirmar</Button>);

    await user.press(screen.getByRole("button", { name: "Confirmar" }));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("shows a spinner and blocks presses while loading", async () => {
    const onPress = jest.fn();
    const user = userEvent.setup();
    render(
      <Button onPress={onPress} loading>
        Salvando…
      </Button>,
    );

    expect(screen.queryByText("Salvando…")).not.toBeOnTheScreen();
    const button = screen.getByRole("button");
    expect(button.props.accessibilityState).toEqual(
      expect.objectContaining({ busy: true, disabled: true }),
    );

    await user.press(button);
    expect(onPress).not.toHaveBeenCalled();
  });
});
