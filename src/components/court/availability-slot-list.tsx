import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { Chip } from "@/components/ui/chip";
import { formatCentsToBRL } from "@/lib/money";
import { minutesToTime } from "@/lib/datetime/format";
import type { GetCourtAvailabilityQueryResponse } from "@/api/generated/types/GetCourtAvailability";

export type AvailabilitySlot = GetCourtAvailabilityQueryResponse[number];

export type AvailabilitySlotListProps = {
  slots: AvailabilitySlot[];
  /** `startMinute` do slot atualmente selecionado, ou `null` se nenhum. */
  selectedStartMinute: number | null;
  onSelectSlot: (slot: AvailabilitySlot) => void;
};

/**
 * Grid de horários de disponibilidade de uma quadra — cada slot vira um
 * `Chip` (mesmo primitivo selecionável usado noutros lugares do app): livre e
 * tocável, ou ocupado (`disabled`, acinzentado pelo próprio `Chip`). Tocar
 * de novo num slot já selecionado desmarca (`onSelectSlot` decide o toggle).
 */
export function AvailabilitySlotList({ slots, selectedStartMinute, onSelectSlot }: AvailabilitySlotListProps) {
  const { t } = useTranslation("booking");

  return (
    <View className="flex-row flex-wrap gap-2" testID="availability-slot-list">
      {slots.map((slot) => {
        const timeRange = `${minutesToTime(slot.startMinute)}–${minutesToTime(slot.endMinute)}`;
        const price = formatCentsToBRL(slot.priceCents);
        const stateLabel = t(slot.available ? "availability.slot.free" : "availability.slot.occupied");

        return (
          <Chip
            key={slot.startMinute}
            label={`${timeRange} · ${price}`}
            selected={slot.available && selectedStartMinute === slot.startMinute}
            disabled={!slot.available}
            accessibilityLabel={`${timeRange} · ${price} · ${stateLabel}`}
            onPress={() => onSelectSlot(slot)}
            testID={`availability-slot-${slot.startMinute}`}
          />
        );
      })}
    </View>
  );
}
