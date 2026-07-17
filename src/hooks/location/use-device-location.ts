import { useCallback, useState } from "react";
import * as Location from "expo-location";

/** Coordenadas + cidade resolvidas a partir do device (reverse-geocode grátis). */
export type DeviceLocation = {
  lat: number;
  lng: number;
  city: string | null;
};

export type UseDeviceLocationResult = {
  /**
   * Pede a permissão de localização (foreground), pega a posição atual e faz o
   * reverse-geocode (tudo via `expo-location`, grátis). Retorna `null` quando a
   * permissão é negada — o chamador cai no fallback (cidade manual / última
   * referência), sem RN Alert.
   */
  getCurrent: () => Promise<DeviceLocation | null>;
  /** `true` depois de uma tentativa em que a permissão foi negada. */
  permissionDenied: boolean;
  /** `true` enquanto uma chamada de `getCurrent` está em andamento. */
  loading: boolean;
};

/**
 * Localização do device via `expo-location`: permissão → posição → cidade
 * (reverse-geocode). Base grátis do LocationPicker e da captura da cidade do
 * jogador — não depende de nenhuma chave do Google.
 */
export function useDeviceLocation(): UseDeviceLocationResult {
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [loading, setLoading] = useState(false);

  const getCurrent = useCallback(async (): Promise<DeviceLocation | null> => {
    setLoading(true);
    try {
      const { granted } = await Location.requestForegroundPermissionsAsync();
      if (!granted) {
        setPermissionDenied(true);
        return null;
      }
      setPermissionDenied(false);

      const position = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = position.coords;

      let city: string | null = null;
      try {
        const geo = await Location.reverseGeocodeAsync({ latitude, longitude });
        city = geo[0]?.city ?? geo[0]?.subregion ?? null;
      } catch {
        // Reverse-geocode pode falhar (offline/rate limit) — coords ainda são
        // úteis, seguimos sem a cidade.
      }

      return { lat: latitude, lng: longitude, city };
    } catch {
      // Falha ao obter a posição (GPS off, timeout) — trata como indisponível.
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { getCurrent, permissionDenied, loading };
}
