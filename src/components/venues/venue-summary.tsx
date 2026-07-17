import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "@/components/ui/text";
import { AMENITY_ICONS, isKnownAmenity } from "@/lib/venue/amenities";
import { colors } from "@/lib/theme";
import { useGetVenue } from "@/api/generated/hooks/venuesHooks/useGetVenue";

export type VenueSummaryProps = {
  venueId: string;
};

/**
 * Cartão da quadra (Venue) exibido na tela da partida quando `match.venueId`
 * está definido: nome, endereço e comodidades (ícones). Silencioso enquanto
 * carrega; some se a quadra não puder ser carregada (o restante da partida
 * segue funcionando).
 */
export function VenueSummary({ venueId }: VenueSummaryProps) {
  const { t } = useTranslation("venue");
  const query = useGetVenue(venueId);
  const venue = query.data;

  if (!venue) return null;

  const amenities = venue.amenities.filter(isKnownAmenity);

  return (
    <View className="gap-2 rounded-2xl border border-line bg-surface p-4" testID="venue-summary">
      <Text className="font-body-semibold text-xs uppercase tracking-wide text-muted">
        {t("summary.title")}
      </Text>
      <Text variant="display" className="text-lg" numberOfLines={1}>
        {venue.name}
      </Text>
      <Text variant="muted" className="text-sm">
        {[venue.address, venue.city].filter(Boolean).join(" · ")}
      </Text>
      {amenities.length > 0 ? (
        <View className="flex-row flex-wrap gap-2 pt-1">
          {amenities.map((amenity) => (
            <View
              key={amenity}
              className="flex-row items-center gap-1.5 rounded-full border border-line bg-surface-up px-2.5 py-1"
              testID={`venue-amenity-${amenity}`}
            >
              <Ionicons name={AMENITY_ICONS[amenity]} size={14} color={colors.muted} />
              <Text className="font-body-medium text-xs text-ink">
                {t(`amenities.${amenity}`)}
              </Text>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}
