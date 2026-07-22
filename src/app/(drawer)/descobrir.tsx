import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, View } from "react-native";
import * as Location from "expo-location";
import MapView, { Circle, Marker, type Region } from "react-native-maps";
import { ScreenContainer } from "@/components/layout/screen-container";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { Toast } from "@/components/ui/toast";
import { useDeviceLocation } from "@/hooks/location/use-device-location";
import { useJoinOpenMatch } from "@/hooks/discover/use-join-open-match";
import { useRequestJoin } from "@/hooks/join-requests/use-request-join";
import { useToast } from "@/hooks/common/use-toast";
import { formatCentsToBRL } from "@/lib/money";
import { formatMatchDateTime } from "@/lib/datetime/format";
import { colors } from "@/lib/theme";
import { useDiscover } from "@/api/generated/hooks/discoverHooks";
import type { Discover200, DiscoverQueryParams } from "@/api/generated/types/Discover";

type ModalityKey = NonNullable<DiscoverQueryParams["modality"]>;
type Coords = { lat: number; lng: number };
type DiscoverMatch = Discover200[number];

const RADIUS_OPTIONS = [2, 5, 10, 25, 50] as const;
const MODALITY_OPTIONS: ModalityKey[] = ["futsal", "society", "campo"];

/**
 * Região que enquadra um círculo de `radiusKm` centrado em `coords` (com uma
 * folga de ~30%). `latitudeDelta` em graus ≈ span_km / 111 — quanto maior o
 * raio, mais o mapa afasta pra o círculo caber inteiro.
 */
function regionForRadius(coords: Coords, radiusKm: number): Region {
  const delta = Math.max(0.02, (radiusKm * 2 * 1.3) / 111);
  return { latitude: coords.lat, longitude: coords.lng, latitudeDelta: delta, longitudeDelta: delta };
}

/**
 * Descobrir (mapa estilo Airbnb) — peladas públicas por raio a partir da
 * localização do jogador. Sem permissão de localização, cai num estado que
 * permite reautorizar ou buscar por cidade (geocode grátis do `expo-location`),
 * sem travar. Requer as chaves de mapa (G1) + prebuild pra ver o mapa de fato.
 */
export default function DescobrirScreen() {
  const { t } = useTranslation(["discover", "common"]);
  const toast = useToast();
  const device = useDeviceLocation();

  const [coords, setCoords] = useState<Coords | null>(null);
  const [cityDraft, setCityDraft] = useState("");
  const [cityLoading, setCityLoading] = useState(false);
  const [radiusKm, setRadiusKm] = useState<number>(10);
  const [modality, setModality] = useState<ModalityKey | null>(null);
  const [maxPriceInput, setMaxPriceInput] = useState("");
  const [selected, setSelected] = useState<DiscoverMatch | null>(null);

  const mapRef = useRef<MapView>(null);
  const joinOpen = useJoinOpenMatch();
  const requestJoin = useRequestJoin();

  const maxPriceReais = Number(maxPriceInput.replace(",", "."));
  const maxPriceCents =
    maxPriceInput.trim() && Number.isFinite(maxPriceReais) && maxPriceReais > 0
      ? Math.round(maxPriceReais * 100)
      : undefined;

  const query = useDiscover(
    {
      lat: coords?.lat ?? 0,
      lng: coords?.lng ?? 0,
      radiusKm,
      ...(modality ? { modality } : {}),
      ...(maxPriceCents != null ? { maxPriceCents } : {}),
    },
    { query: { enabled: !!coords } },
  );

  const matches = query.data ?? [];

  const handleUseLocation = useCallback(async () => {
    const current = await device.getCurrent();
    if (current) setCoords({ lat: current.lat, lng: current.lng });
  }, [device]);

  // Tenta localizar já na chegada — se a permissão for negada, o estado abaixo
  // oferece reautorizar / buscar por cidade (sem travar a tela).
  useEffect(() => {
    // Efeito assíncrono: o `setCoords` só roda depois do `await` dentro de
    // `handleUseLocation` (não é setState síncrono), mas o lint não consegue
    // provar isso — daí o disable pontual.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void handleUseLocation();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- só na montagem.
  }, []);

  const handleCitySearch = useCallback(async () => {
    if (!cityDraft.trim()) return;
    setCityLoading(true);
    try {
      const results = await Location.geocodeAsync(cityDraft.trim());
      const first = results[0];
      if (first) setCoords({ lat: first.latitude, lng: first.longitude });
    } catch {
      // Geocode pode falhar (offline) — mantém o estado atual, sem crashar.
    } finally {
      setCityLoading(false);
    }
  }, [cityDraft]);

  const handleJoin = useCallback(async () => {
    if (!selected) return;
    const isOpen = selected.joinPolicy === "open";
    try {
      if (isOpen) await joinOpen.mutateAsync(selected.matchId);
      else await requestJoin.mutateAsync(selected.matchId);
      toast.show(t(isOpen ? "discover:card.joinOpenSuccess" : "discover:card.joinRequestSuccess"));
      setSelected(null);
    } catch {
      toast.show(t(isOpen ? "discover:card.joinOpenError" : "discover:card.joinRequestError"), "danger");
    }
  }, [joinOpen, requestJoin, selected, t, toast]);

  const region: Region | undefined = coords ? regionForRadius(coords, radiusKm) : undefined;

  // Reenquadra o mapa quando o raio (ou a localização) muda, pra o círculo do
  // raio caber na tela — `initialRegion` só vale na 1ª montagem.
  useEffect(() => {
    if (region) mapRef.current?.animateToRegion(region, 300);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reage a coords+raio (region é derivado).
  }, [coords, radiusKm]);

  const joining = joinOpen.isPending || requestJoin.isPending;

  return (
    <ScreenContainer className="gap-4" edges={["bottom"]}>
      <View className="gap-1">
        <Text variant="display" className="text-2xl">
          {t("discover:title")}
        </Text>
        <Text variant="muted" className="text-sm">
          {t("discover:subtitle")}
        </Text>
      </View>

      {toast.message ? (
        <Toast variant={toast.variant} onDismiss={toast.dismiss}>
          {toast.message}
        </Toast>
      ) : null}

      {!coords ? (
        <View className="gap-3 rounded-xl border border-line bg-surface p-4" testID="discover-need-location">
          <Text variant="display" className="text-lg">
            {t("discover:location.needTitle")}
          </Text>
          <Text variant="muted" className="text-sm">
            {t("discover:location.needHint")}
          </Text>
          <Button
            onPress={() => void handleUseLocation()}
            loading={device.loading}
            testID="discover-use-location"
          >
            {device.loading ? t("discover:locating") : t("discover:location.useLocationCta")}
          </Button>
          <Input
            label={t("common:location.cityLabel")}
            placeholder={t("common:location.cityPlaceholder")}
            value={cityDraft}
            onChangeText={setCityDraft}
            onSubmitEditing={() => void handleCitySearch()}
            testID="discover-city-input"
          />
          <Button
            variant="secondary"
            onPress={() => void handleCitySearch()}
            loading={cityLoading}
            testID="discover-city-search"
          >
            {t("common:actions.search")}
          </Button>
          {device.permissionDenied ? (
            <Text className="font-body text-sm text-muted">
              {t("discover:location.permissionDenied")}
            </Text>
          ) : null}
        </View>
      ) : (
        <>
          <View className="gap-2">
            <Text className="font-body-medium text-sm text-muted">
              {t("discover:filters.radiusLabel")}
            </Text>
            <View className="flex-row gap-2">
              {RADIUS_OPTIONS.map((km) => (
                <Chip
                  key={km}
                  label={t("discover:filters.radius", { km })}
                  selected={radiusKm === km}
                  onPress={() => setRadiusKm(km)}
                  testID={`discover-radius-${km}`}
                />
              ))}
            </View>
          </View>

          <View className="gap-2">
            <Text className="font-body-medium text-sm text-muted">
              {t("discover:filters.modalityLabel")}
            </Text>
            <View className="flex-row flex-wrap gap-2">
              <Chip
                label={t("discover:filters.modalityAll")}
                selected={modality === null}
                onPress={() => setModality(null)}
                testID="discover-modality-all"
              />
              {MODALITY_OPTIONS.map((option) => (
                <Chip
                  key={option}
                  label={t(`discover:modality.${option}`)}
                  selected={modality === option}
                  onPress={() => setModality(option)}
                  testID={`discover-modality-${option}`}
                />
              ))}
            </View>
          </View>

          <Input
            label={t("discover:filters.maxPriceLabel")}
            placeholder={t("discover:filters.maxPricePlaceholder")}
            keyboardType="decimal-pad"
            value={maxPriceInput}
            onChangeText={setMaxPriceInput}
            testID="discover-max-price"
          />

          <View className="overflow-hidden rounded-xl border border-line" style={{ height: 320 }}>
            <MapView
              ref={mapRef}
              style={{ flex: 1 }}
              initialRegion={region}
              showsUserLocation
              testID="discover-map"
            >
              {coords ? (
                <Circle
                  center={{ latitude: coords.lat, longitude: coords.lng }}
                  radius={radiusKm * 1000}
                  strokeColor={colors.primary}
                  strokeWidth={2}
                  fillColor="rgba(33,199,118,0.12)"
                  testID="discover-radius-circle"
                />
              ) : null}
              {matches.map((match) => (
                <Marker
                  key={match.matchId}
                  coordinate={{ latitude: match.latitude, longitude: match.longitude }}
                  pinColor={match.full ? colors.danger : colors.primary}
                  onPress={() => setSelected(match)}
                  testID={`discover-marker-${match.matchId}`}
                />
              ))}
            </MapView>
          </View>

          {query.isError ? (
            <Text className="font-body text-sm text-danger">{t("discover:loadError")}</Text>
          ) : null}

          {!query.isPending && !query.isError && matches.length === 0 ? (
            <Text variant="muted" className="text-center text-sm">
              {t("discover:empty")}
            </Text>
          ) : null}

          {selected ? (
            <View className="gap-2 rounded-2xl border border-line bg-surface p-4" testID="discover-card">
              <View className="flex-row items-start justify-between gap-2">
                <Text className="flex-1 font-body-semibold text-lg text-ink" numberOfLines={1}>
                  {selected.groupName}
                </Text>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={t("common:actions.close")}
                  hitSlop={8}
                  onPress={() => setSelected(null)}
                  testID="discover-card-close"
                >
                  <Text className="font-body-semibold text-muted">✕</Text>
                </Pressable>
              </View>
              <Text className="font-body text-sm text-ink">
                {formatMatchDateTime(selected.datetime)}
              </Text>
              <Text variant="muted" className="text-sm">
                {[selected.location, selected.city].filter(Boolean).join(" · ")}
              </Text>
              <View className="flex-row flex-wrap items-center gap-x-3 gap-y-1">
                <Text className="font-body-medium text-sm text-ink">
                  {selected.priceCents > 0
                    ? formatCentsToBRL(selected.priceCents)
                    : t("discover:card.free")}
                </Text>
                <Text className={selected.full ? "font-body-medium text-sm text-danger" : "font-body-medium text-sm text-primary"}>
                  {selected.full
                    ? t("discover:card.full")
                    : t("discover:card.slots", {
                        confirmed: selected.confirmedCount,
                        slots: selected.slots,
                      })}
                </Text>
                <Text variant="muted" className="text-sm">
                  {t("discover:card.distance", { km: selected.distanceKm.toFixed(1) })}
                </Text>
              </View>
              <Button
                onPress={() => void handleJoin()}
                loading={joining}
                disabled={selected.full && selected.joinPolicy === "open"}
                testID="discover-join"
              >
                {selected.joinPolicy === "open"
                  ? t("discover:card.joinOpenCta")
                  : t("discover:card.joinRequestCta")}
              </Button>
            </View>
          ) : null}
        </>
      )}
    </ScreenContainer>
  );
}
