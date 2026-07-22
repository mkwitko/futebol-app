import { useAuth } from "@/hooks/auth/use-auth";
import { useGetPlayerSuggestions } from "@/api/generated/hooks/playersHooks";

const RADIUS_KM = 50;
const LIMIT = 20;

/**
 * "Sugestões pra você" no Buscar — jogadores perto de você (`GET
 * /players/suggestions`), habilitado só quando `enabled` (campo de busca
 * vazio) e o jogador já tem `lastLat/lastLng` salvos (`useAuth().user`). Sem
 * coords, o chamador mostra o hint de localização em vez da lista.
 */
export function usePlayerSuggestions(enabled: boolean) {
  const { user } = useAuth();
  const hasCoords = user?.lastLat != null && user?.lastLng != null;

  const query = useGetPlayerSuggestions(
    { radiusKm: RADIUS_KM, limit: LIMIT },
    { query: { enabled: enabled && hasCoords } },
  );

  return { query, hasCoords };
}
