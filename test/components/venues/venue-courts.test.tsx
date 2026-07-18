import { screen, userEvent } from "@testing-library/react-native";
import { useRouter } from "expo-router";
import { VenueCourts } from "@/components/venues/venue-courts";
import { FAKE_COURT, FAKE_VENUE, resetGroupsMocks, setCourtsMock } from "../../mocks/handlers";
import { renderWithProviders } from "../../utils/render";

jest.mock("expo-router", () => {
  const actual = jest.requireActual("expo-router");
  return { ...actual, useRouter: jest.fn() };
});

describe("VenueCourts", () => {
  const push = jest.fn();

  beforeEach(() => {
    resetGroupsMocks();
    push.mockClear();
    (useRouter as jest.Mock).mockReturnValue({ push, back: jest.fn(), replace: jest.fn() });
  });

  it("lists active courts with their modality label", async () => {
    renderWithProviders(<VenueCourts venueId={FAKE_VENUE.id} />);

    expect(await screen.findByText("Quadra 1")).toBeOnTheScreen();
    expect(screen.getByText("Society")).toBeOnTheScreen();
  });

  it("hides inactive courts — those are organizer/owner web management, not a player choice", async () => {
    setCourtsMock(FAKE_VENUE.id, [
      { ...FAKE_COURT, id: "court-active", name: "Quadra Ativa", active: true },
      { ...FAKE_COURT, id: "court-inactive", name: "Quadra Inativa", active: false },
    ]);

    renderWithProviders(<VenueCourts venueId={FAKE_VENUE.id} />);

    expect(await screen.findByText("Quadra Ativa")).toBeOnTheScreen();
    expect(screen.queryByText("Quadra Inativa")).not.toBeOnTheScreen();
  });

  it("navigates to the court's availability screen on tap, passing id and name", async () => {
    const user = userEvent.setup();
    renderWithProviders(<VenueCourts venueId={FAKE_VENUE.id} />);

    await user.press(await screen.findByText("Quadra 1"));

    expect(push).toHaveBeenCalledWith({
      pathname: "/court/[id]/availability",
      params: { id: FAKE_COURT.id, name: FAKE_COURT.name },
    });
  });

  it("shows the empty state when the venue has no active courts", async () => {
    setCourtsMock(FAKE_VENUE.id, []);

    renderWithProviders(<VenueCourts venueId={FAKE_VENUE.id} />);

    expect(await screen.findByText("Essa quadra ainda não tem horários pra reservar.")).toBeOnTheScreen();
  });
});
