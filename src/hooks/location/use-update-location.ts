import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useUpdateMeLocation } from "@/api/generated/hooks/authHooks";
import { AUTH } from "@/api/modules/auth";
import { useDeviceLocation } from "./use-device-location";

/**
 * Captura/atualiza a última localização do jogador (`User.lastCity/lastLat/lastLng`).
 *
 * - `captureFromDevice()`: pede a geo do device (expo-location) e grava
 *   lat/lng/cidade. Retorna a cidade salva, ou `null` se a permissão foi negada
 *   (o chamador então pede a cidade manual). Sem cidade resolvida ⇒ não grava
 *   (o backend exige `city`).
 * - `setCity(city)`: grava só a cidade (fallback manual, sem coords).
 *
 * Ambos invalidam `getMe` pra a UI refletir a nova `lastCity`.
 */
export function useUpdateLocation() {
  const queryClient = useQueryClient();
  const device = useDeviceLocation();
  const mutation = useUpdateMeLocation();

  const invalidateMe = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: AUTH.queryKeyRoot });
  }, [queryClient]);

  const captureFromDevice = useCallback(async (): Promise<string | null> => {
    const current = await device.getCurrent();
    if (!current || !current.city) return null;
    await mutation.mutateAsync({
      data: { lat: current.lat, lng: current.lng, city: current.city },
    });
    invalidateMe();
    return current.city;
  }, [device, invalidateMe, mutation]);

  const setCity = useCallback(
    async (city: string): Promise<void> => {
      const trimmed = city.trim();
      if (!trimmed) return;
      await mutation.mutateAsync({ data: { city: trimmed } });
      invalidateMe();
    },
    [invalidateMe, mutation],
  );

  return {
    captureFromDevice,
    setCity,
    permissionDenied: device.permissionDenied,
    isPending: device.loading || mutation.isPending,
  };
}
