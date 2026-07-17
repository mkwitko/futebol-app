import { render, screen, userEvent } from "@testing-library/react-native";
import { RoleSelector } from "@/components/auth/role-selector";
import type { Role } from "@/lib/auth/roles";

describe("RoleSelector", () => {
  it("renders the three account types with pt-BR labels", () => {
    render(<RoleSelector value={["jogador"]} onChange={jest.fn()} />);

    expect(screen.getByText("Jogador")).toBeOnTheScreen();
    expect(screen.getByText("Organizador")).toBeOnTheScreen();
    expect(screen.getByText("Dono de quadra")).toBeOnTheScreen();
  });

  it("adds a role when an unselected chip is pressed", async () => {
    const onChange = jest.fn();
    const user = userEvent.setup();
    render(<RoleSelector value={["jogador"]} onChange={onChange} testIDPrefix="role" />);

    await user.press(screen.getByTestId("role-organizador"));

    expect(onChange).toHaveBeenCalledWith(["jogador", "organizador"] satisfies Role[]);
  });

  it("removes a role when a selected chip is pressed", async () => {
    const onChange = jest.fn();
    const user = userEvent.setup();
    render(<RoleSelector value={["jogador", "quadra"]} onChange={onChange} testIDPrefix="role" />);

    await user.press(screen.getByTestId("role-jogador"));

    expect(onChange).toHaveBeenCalledWith(["quadra"] satisfies Role[]);
  });

  it("shows the web-management note only when quadra is selected", () => {
    const { rerender } = render(<RoleSelector value={["jogador"]} onChange={jest.fn()} testIDPrefix="role" />);
    expect(screen.queryByTestId("role-quadra-note")).not.toBeOnTheScreen();

    rerender(<RoleSelector value={["quadra"]} onChange={jest.fn()} testIDPrefix="role" />);
    expect(screen.getByTestId("role-quadra-note")).toBeOnTheScreen();
    expect(screen.getByText(/gestão da sua quadra é feita no site camisa7/i)).toBeOnTheScreen();
  });
});
