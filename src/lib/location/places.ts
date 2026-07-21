import { env, isPlacesAutocompleteEnabled } from "@/env";

/**
 * Provider de autocomplete de endereço via Photon (https://photon.komoot.io)
 * — OSM-backed, sem chave, sem billing, sem rate limit rígido. Endpoint único:
 * GET /api/?q=&limit= que retorna `features[]` com
 * `properties.{name,city,state,country,osm_id,osm_type}` e
 * `geometry.{coordinates:[lng,lat]}`. Pesquisa cobre ruas, bairros, cidades.
 *
 * Diferente do Google Places, o Photon devolve coordenadas + rótulos na
 * PRÓPRIA resposta da busca — não existe endpoint "details" separado. Por isso
 * cada `PlaceSuggestion` já carrega `lat/lng/city`, e o LocationPicker aplica a
 * seleção direto, sem uma segunda chamada de rede. Resultado: mesma UX, zero
 * chave, zero custo, uma requisição por seleção.
 */
const PHOTON_URL = "https://photon.komoot.io/api/";

/** Sugestão de endereço do autocomplete, com coords já resolvidas. */
export type PlaceSuggestion = {
  placeId: string;
  description: string;
  lat: number;
  lng: number;
  city: string | null;
};

/**
 * Resultado de `searchPlaces` — distingue "sem sugestões porque nada casa"
 * (sucesso vazio) de "API indisponível temporariamente" (UI mostra o estado
 * normal de busca sem sugestão, sem mensagem de erro assustadora — o usuário
 * pode continuar digitando e o mapa+reverse-geocode continuam funcionando).
 */
export type SearchPlacesResult = {
  suggestions: PlaceSuggestion[];
  error: "off" | "denied" | null;
};

type PhotonFeature = {
  geometry: { coordinates: [number, number] };
  properties: {
    osm_id: number;
    osm_type: string;
    name?: string;
    street?: string;
    housenumber?: string;
    suburb?: string;
    district?: string;
    city?: string;
    town?: string;
    village?: string;
    county?: string;
    state?: string;
    country?: string;
    type?: string;
  };
};

type PhotonResponse = {
  features: PhotonFeature[];
};

/** Monta a linha "Rua, Cidade - UF, País" no padrão que o usuário espera. */
function formatDescription(p: PhotonFeature["properties"]): string {
  const street = [p.housenumber, p.street].filter(Boolean).join(" ").trim();
  const locality = p.city ?? p.town ?? p.village ?? p.suburb ?? p.district ?? p.county ?? "";
  const state = p.state ?? "";
  const country = p.country ?? "";
  const parts = [
    [street || p.name, locality].filter(Boolean).join(", "),
    [state, country].filter(Boolean).join(", "),
  ].filter(Boolean);
  return parts.join(", ");
}

/** Cidade preferencial a partir das propriedades do Photon. */
function extractCity(p: PhotonFeature["properties"]): string | null {
  return p.city ?? p.town ?? p.village ?? p.county ?? null;
}

/**
 * Busca sugestões de endereço no Photon Autocomplete (via `fetch` direto — sem
 * lib pesada, fácil de gatear/trocar). Retorna `{ suggestions: [], error: ... }`
 * quando o autocomplete está desligado/sem flag ou em qualquer falha — o
 * LocationPicker usa `error` pra mostrar feedback útil em vez de parecer que
 * nada acontece.
 */
export async function searchPlaces(query: string): Promise<SearchPlacesResult> {
  if (!isPlacesAutocompleteEnabled) return { suggestions: [], error: "off" };
  const trimmed = query.trim();
  if (trimmed.length < 3) return { suggestions: [], error: null };

  try {
    // Photon só aceita lang ∈ {default, de, en, fr} — "pt" retorna 400. Sem
    // lang cai no "default", que já traz os nomes locais (pt-BR) do OSM.
    const params = new URLSearchParams({
      q: trimmed,
      limit: "6",
    });
    const res = await fetch(`${PHOTON_URL}?${params.toString()}`);
    if (!res.ok) return { suggestions: [], error: null };
    const json = (await res.json()) as PhotonResponse;
    const features = json.features ?? [];

    return {
      suggestions: features.map((f) => {
        const [lng, lat] = f.geometry.coordinates;
        return {
          placeId: `${f.properties.osm_type}:${f.properties.osm_id}`,
          description: formatDescription(f.properties),
          lat,
          lng,
          city: extractCity(f.properties),
        };
      }),
      error: null,
    };
  } catch {
    return { suggestions: [], error: null };
  }
}
