import { useCallback, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, View } from "react-native";
import * as Location from "expo-location";
import MapView, { Marker, type MapPressEvent, type Region } from "react-native-maps";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { useDeviceLocation } from "@/hooks/location/use-device-location";
import { isPlacesAutocompleteEnabled } from "@/env";
import { placeDetails, searchPlaces, type PlaceSuggestion } from "@/lib/location/places";

/**
 * Local escolhido no picker. Coords podem ser `null` (cidade digitada à mão,
 * sem pin) — casa com o schema do create-match (todos nullable/opcionais).
 */
export type LocationValue = {
  latitude: number | null;
  longitude: number | null;
  city: string | null;
  address: string | null;
};

export type LocationPickerProps = {
  value: LocationValue | null;
  onChange: (value: LocationValue) => void;
};

// Região default (Porto Alegre) quando ainda não há pin — só pra centralizar o
// mapa; não vira valor até o usuário interagir.
const DEFAULT_REGION: Region = {
  latitude: -30.0346,
  longitude: -51.2177,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

/**
 * Reverse-geocode grátis (expo-location) de umas coords → cidade/endereço.
 * Nunca lança — em falha volta `{ city: null, address: null }`.
 */
async function resolveFromCoords(
  latitude: number,
  longitude: number,
): Promise<{ city: string | null; address: string | null }> {
  try {
    const geo = await Location.reverseGeocodeAsync({ latitude, longitude });
    const first = geo[0];
    if (!first) return { city: null, address: null };
    const city = first.city ?? first.subregion ?? null;
    const address =
      [first.street, first.name, first.district].filter(Boolean).join(", ") || null;
    return { city, address };
  } catch {
    return { city: null, address: null };
  }
}

/**
 * Escolhe o local da pelada: mapa (`react-native-maps`) com pino arrastável +
 * "usar minha localização" + reverse-geocode grátis (base, sem chave). Quando
 * o Places Autocomplete está ligado (`isPlacesAutocompleteEnabled`), mostra
 * também uma barra de busca de endereço. Input de cidade sempre disponível como
 * fallback (geo negada / sem pin).
 */
export function LocationPicker({ value, onChange }: LocationPickerProps) {
  const { t } = useTranslation("common");
  const mapRef = useRef<MapView>(null);
  const device = useDeviceLocation();

  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);

  const hasCoords = value?.latitude != null && value?.longitude != null;
  const markerCoord = hasCoords
    ? { latitude: value!.latitude as number, longitude: value!.longitude as number }
    : { latitude: DEFAULT_REGION.latitude, longitude: DEFAULT_REGION.longitude };

  const centerOn = useCallback((latitude: number, longitude: number) => {
    mapRef.current?.animateToRegion({
      latitude,
      longitude,
      latitudeDelta: 0.02,
      longitudeDelta: 0.02,
    });
  }, []);

  const applyCoords = useCallback(
    async (latitude: number, longitude: number) => {
      const { city, address } = await resolveFromCoords(latitude, longitude);
      onChange({ latitude, longitude, city: city ?? value?.city ?? null, address });
    },
    [onChange, value?.city],
  );

  const handleMapPress = useCallback(
    (event: MapPressEvent) => {
      const { latitude, longitude } = event.nativeEvent.coordinate;
      void applyCoords(latitude, longitude);
    },
    [applyCoords],
  );

  const handleUseMyLocation = useCallback(async () => {
    const current = await device.getCurrent();
    if (!current) return;
    centerOn(current.lat, current.lng);
    onChange({
      latitude: current.lat,
      longitude: current.lng,
      city: current.city ?? value?.city ?? null,
      address: value?.address ?? null,
    });
  }, [centerOn, device, onChange, value?.address, value?.city]);

  const handleSearchChange = useCallback(async (text: string) => {
    setQuery(text);
    const results = await searchPlaces(text);
    setSuggestions(results);
  }, []);

  const handleSelectSuggestion = useCallback(
    async (suggestion: PlaceSuggestion) => {
      setSuggestions([]);
      setQuery(suggestion.description);
      const details = await placeDetails(suggestion.placeId);
      if (!details) return;
      centerOn(details.lat, details.lng);
      onChange({
        latitude: details.lat,
        longitude: details.lng,
        city: details.city,
        address: details.address || suggestion.description,
      });
    },
    [centerOn, onChange],
  );

  const handleCityChange = useCallback(
    (city: string) => {
      onChange({
        latitude: value?.latitude ?? null,
        longitude: value?.longitude ?? null,
        city: city.length > 0 ? city : null,
        address: value?.address ?? null,
      });
    },
    [onChange, value?.address, value?.latitude, value?.longitude],
  );

  return (
    <View className="gap-2">
      {isPlacesAutocompleteEnabled ? (
        <View className="gap-1">
          <Input
            label={t("location.searchLabel")}
            placeholder={t("location.searchPlaceholder")}
            value={query}
            onChangeText={handleSearchChange}
            autoCapitalize="none"
            testID="location-search"
          />
          {suggestions.length > 0 ? (
            <View className="overflow-hidden rounded-xl border border-line bg-surface">
              {suggestions.map((suggestion) => (
                <Pressable
                  key={suggestion.placeId}
                  onPress={() => void handleSelectSuggestion(suggestion)}
                  className="border-b border-line px-4 py-3 active:bg-surface-up"
                  accessibilityRole="button"
                >
                  <Text className="font-body text-sm text-ink">{suggestion.description}</Text>
                </Pressable>
              ))}
            </View>
          ) : null}
        </View>
      ) : null}

      <View className="overflow-hidden rounded-xl border border-line" style={{ height: 220 }}>
        <MapView
          ref={mapRef}
          style={{ flex: 1 }}
          initialRegion={
            hasCoords
              ? { ...markerCoord, latitudeDelta: 0.02, longitudeDelta: 0.02 }
              : DEFAULT_REGION
          }
          showsUserLocation
          onPress={handleMapPress}
          testID="location-map"
        >
          {hasCoords ? (
            <Marker
              draggable
              coordinate={markerCoord}
              onDragEnd={(event) => {
                const { latitude, longitude } = event.nativeEvent.coordinate;
                void applyCoords(latitude, longitude);
              }}
              testID="location-marker"
            />
          ) : null}
        </MapView>
      </View>

      <Button
        variant="secondary"
        size="sm"
        onPress={() => void handleUseMyLocation()}
        loading={device.loading}
        testID="location-use-mine"
      >
        {device.loading ? t("location.locating") : t("location.useMyLocation")}
      </Button>

      {device.permissionDenied ? (
        <Text className="font-body text-sm text-muted">{t("location.permissionDenied")}</Text>
      ) : null}

      <Input
        label={t("location.cityLabel")}
        placeholder={t("location.cityPlaceholder")}
        value={value?.city ?? ""}
        onChangeText={handleCityChange}
        testID="location-city"
      />
    </View>
  );
}
