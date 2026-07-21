import { searchPlaces } from "@/lib/location/places";

// Photon ligado — o gate real depende de env; aqui forçamos "on" pra testar o
// mapeamento da resposta. Off é coberto pelo caso "returns off".
jest.mock("@/env", () => ({
  isPlacesAutocompleteEnabled: true,
}));

function mockFetchOnce(body: unknown, ok = true) {
  (globalThis.fetch as jest.Mock).mockResolvedValueOnce({
    ok,
    json: async () => body,
  });
}

const PHOTON_FEATURE = {
  geometry: { coordinates: [-51.2177, -30.0346] as [number, number] },
  properties: {
    osm_id: 12345,
    osm_type: "node",
    street: "Avenida Ipiranga",
    housenumber: "40",
    city: "Porto Alegre",
    state: "Rio Grande do Sul",
    country: "Brasil",
  },
};

describe("searchPlaces", () => {
  beforeEach(() => {
    globalThis.fetch = jest.fn();
  });

  it("returns coords + city embedded in each suggestion (single call, no details lookup)", async () => {
    mockFetchOnce({ features: [PHOTON_FEATURE] });

    const result = await searchPlaces("avenida ipiranga");

    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
    expect(result.error).toBeNull();
    expect(result.suggestions).toEqual([
      {
        placeId: "node:12345",
        description: "40 Avenida Ipiranga, Porto Alegre, Rio Grande do Sul, Brasil",
        lat: -30.0346,
        lng: -51.2177,
        city: "Porto Alegre",
      },
    ]);
  });

  it("does not hit the network for queries shorter than 3 chars", async () => {
    const result = await searchPlaces("ab");
    expect(globalThis.fetch).not.toHaveBeenCalled();
    expect(result).toEqual({ suggestions: [], error: null });
  });

  it("swallows a non-ok response as empty (no scary error)", async () => {
    mockFetchOnce({}, false);
    const result = await searchPlaces("nowhere");
    expect(result).toEqual({ suggestions: [], error: null });
  });

  it("swallows a network throw as empty", async () => {
    (globalThis.fetch as jest.Mock).mockRejectedValueOnce(new Error("offline"));
    const result = await searchPlaces("offline place");
    expect(result).toEqual({ suggestions: [], error: null });
  });
});
