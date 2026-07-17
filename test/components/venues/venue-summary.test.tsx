import { screen } from "@testing-library/react-native";
import { VenueSummary } from "@/components/venues/venue-summary";
import { FAKE_VENUE, resetGroupsMocks, setVenueMock } from "../../mocks/handlers";
import { renderWithProviders } from "../../utils/render";

describe("VenueSummary", () => {
  beforeEach(() => {
    resetGroupsMocks();
  });

  it("fetches the venue and shows name, address and amenity labels", async () => {
    renderWithProviders(<VenueSummary venueId={FAKE_VENUE.id} />);

    expect(await screen.findByText("Arena Central")).toBeOnTheScreen();
    expect(screen.getByText(/Av\. Ipiranga, 1000/)).toBeOnTheScreen();
    // Amenities do fixture (gramado/iluminacao/estacionamento) → labels pt-BR.
    expect(screen.getByText("Gramado")).toBeOnTheScreen();
    expect(screen.getByText("Iluminação")).toBeOnTheScreen();
    expect(screen.getByText("Estacionamento")).toBeOnTheScreen();
    expect(screen.getByTestId("venue-amenity-gramado")).toBeOnTheScreen();
  });

  it("renders without amenities when the venue has none", async () => {
    setVenueMock({ ...FAKE_VENUE, id: "venue-empty", amenities: [] });

    renderWithProviders(<VenueSummary venueId="venue-empty" />);

    expect(await screen.findByText("Arena Central")).toBeOnTheScreen();
    expect(screen.queryByTestId("venue-amenity-gramado")).not.toBeOnTheScreen();
  });
});
