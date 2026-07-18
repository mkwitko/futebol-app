import { screen, userEvent } from "@testing-library/react-native";
import { render } from "@testing-library/react-native";
import { AvailabilitySlotList } from "@/components/court/availability-slot-list";

const SLOTS = [
  { startMinute: 19 * 60, endMinute: 20 * 60, priceCents: 8000, available: true },
  { startMinute: 20 * 60, endMinute: 21 * 60, priceCents: 10000, available: false },
];

describe("AvailabilitySlotList", () => {
  it("formats the time range as HH:MM–HH:MM and the price as BRL", () => {
    render(<AvailabilitySlotList slots={SLOTS} selectedStartMinute={null} onSelectSlot={jest.fn()} />);

    expect(screen.getByText("19:00–20:00 · R$ 80,00")).toBeOnTheScreen();
    expect(screen.getByText("20:00–21:00 · R$ 100,00")).toBeOnTheScreen();
  });

  it("marks the occupied slot as disabled and the free slot as enabled", () => {
    render(<AvailabilitySlotList slots={SLOTS} selectedStartMinute={null} onSelectSlot={jest.fn()} />);

    expect(
      screen.getByTestId(`availability-slot-${SLOTS[0]!.startMinute}`).props.accessibilityState?.disabled,
    ).not.toBe(true);
    expect(
      screen.getByTestId(`availability-slot-${SLOTS[1]!.startMinute}`).props.accessibilityState?.disabled,
    ).toBe(true);
  });

  it("calls onSelectSlot when tapping a free slot", async () => {
    const user = userEvent.setup();
    const onSelectSlot = jest.fn();
    render(<AvailabilitySlotList slots={SLOTS} selectedStartMinute={null} onSelectSlot={onSelectSlot} />);

    await user.press(screen.getByTestId(`availability-slot-${SLOTS[0]!.startMinute}`));

    expect(onSelectSlot).toHaveBeenCalledWith(SLOTS[0]);
  });

  it("does not call onSelectSlot when tapping an occupied slot", async () => {
    const user = userEvent.setup();
    const onSelectSlot = jest.fn();
    render(<AvailabilitySlotList slots={SLOTS} selectedStartMinute={null} onSelectSlot={onSelectSlot} />);

    await user.press(screen.getByTestId(`availability-slot-${SLOTS[1]!.startMinute}`));

    expect(onSelectSlot).not.toHaveBeenCalled();
  });

  it("marks the selected free slot as selected", () => {
    render(
      <AvailabilitySlotList slots={SLOTS} selectedStartMinute={SLOTS[0]!.startMinute} onSelectSlot={jest.fn()} />,
    );

    expect(
      screen.getByTestId(`availability-slot-${SLOTS[0]!.startMinute}`).props.accessibilityState?.selected,
    ).toBe(true);
  });
});
