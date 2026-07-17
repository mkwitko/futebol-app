import { env, isPlacesAutocompleteEnabled } from "@/env";

/** Sugestão de endereço do Places Autocomplete. */
export type PlaceSuggestion = {
  placeId: string;
  description: string;
};

/** Detalhes resolvidos de um place (coords + rótulos). */
export type PlaceDetails = {
  lat: number;
  lng: number;
  address: string;
  city: string | null;
};

const AUTOCOMPLETE_URL = "https://maps.googleapis.com/maps/api/place/autocomplete/json";
const DETAILS_URL = "https://maps.googleapis.com/maps/api/place/details/json";

/**
 * Busca sugestões de endereço no Google Places Autocomplete (via `fetch`
 * direto — sem lib pesada, fácil de gatear/trocar por Nominatim depois).
 * Retorna `[]` quando o autocomplete está desligado/sem chave
 * (`isPlacesAutocompleteEnabled`) ou em qualquer falha — o LocationPicker
 * simplesmente não mostra sugestões e segue no mapa+pin.
 */
export async function searchPlaces(query: string): Promise<PlaceSuggestion[]> {
  if (!isPlacesAutocompleteEnabled) return [];
  const trimmed = query.trim();
  if (trimmed.length < 3) return [];

  try {
    const params = new URLSearchParams({
      input: trimmed,
      key: env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY,
      language: "pt-BR",
    });
    const res = await fetch(`${AUTOCOMPLETE_URL}?${params.toString()}`);
    if (!res.ok) return [];
    const json = (await res.json()) as {
      status?: string;
      predictions?: { place_id: string; description: string }[];
    };
    if (json.status !== "OK" || !json.predictions) return [];
    return json.predictions.map((p) => ({ placeId: p.place_id, description: p.description }));
  } catch {
    return [];
  }
}

/**
 * Resolve coords + endereço/cidade de um place (Places Details). Retorna `null`
 * quando desligado/sem chave ou em falha. A cidade sai do componente de
 * endereço `locality` (ou `administrative_area_level_2` como fallback).
 */
export async function placeDetails(placeId: string): Promise<PlaceDetails | null> {
  if (!isPlacesAutocompleteEnabled) return null;

  try {
    const params = new URLSearchParams({
      place_id: placeId,
      key: env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY,
      language: "pt-BR",
      fields: "geometry,formatted_address,address_components",
    });
    const res = await fetch(`${DETAILS_URL}?${params.toString()}`);
    if (!res.ok) return null;
    const json = (await res.json()) as {
      status?: string;
      result?: {
        geometry?: { location?: { lat: number; lng: number } };
        formatted_address?: string;
        address_components?: { long_name: string; types: string[] }[];
      };
    };
    const result = json.result;
    const loc = result?.geometry?.location;
    if (json.status !== "OK" || !loc) return null;

    const components = result?.address_components ?? [];
    const cityComponent =
      components.find((c) => c.types.includes("locality")) ??
      components.find((c) => c.types.includes("administrative_area_level_2"));

    return {
      lat: loc.lat,
      lng: loc.lng,
      address: result?.formatted_address ?? "",
      city: cityComponent?.long_name ?? null,
    };
  } catch {
    return null;
  }
}
