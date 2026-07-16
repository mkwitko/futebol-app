import { View } from "react-native";
import { Chip } from "@/components/ui/chip";
import { Stepper } from "@/components/ui/stepper";
import { Text } from "@/components/ui/text";
import type { AffinityMap } from "@/lib/player/affinity";
import { POSITIONS, type Position, positionLabel } from "@/lib/player/position";

const AFFINITY_MAX = 100;
const AFFINITY_STEP = 5;
const DEFAULT_AFFINITY = 50;

export type AffinityPickerProps = {
  /** Mapa esparso `{posição: 0-100}` — só posições declaradas. */
  value: AffinityMap;
  onChange: (next: AffinityMap) => void;
  /** Overall real por posição (dos stats/carreira), read-only, exibido ao lado. */
  overallByPosition?: Partial<Record<Position, number>>;
  affinityLabel?: string;
  overallLabel?: string;
};

/**
 * Editor estilo Football Manager (Bloco A): o jogador escolhe as N posições
 * que joga (chips) e ajusta a afinidade (0-100) de cada. O overall real por
 * posição (dos stats) aparece ao lado, read-only.
 */
export function AffinityPicker({
  value,
  onChange,
  overallByPosition,
  affinityLabel = "Afinidade",
  overallLabel = "Overall",
}: AffinityPickerProps) {
  const active = POSITIONS.filter((p) => value[p] !== undefined);

  const toggle = (position: Position) => {
    const next: AffinityMap = { ...value };
    if (next[position] !== undefined) delete next[position];
    else next[position] = DEFAULT_AFFINITY;
    onChange(next);
  };

  const setAffinity = (position: Position, affinity: number) => {
    onChange({ ...value, [position]: affinity });
  };

  return (
    <View className="gap-3">
      <View className="flex-row flex-wrap gap-2">
        {POSITIONS.map((position) => (
          <Chip
            key={position}
            label={positionLabel(position)}
            selected={value[position] !== undefined}
            onPress={() => toggle(position)}
            accessibilityLabel={positionLabel(position)}
          />
        ))}
      </View>

      {active.map((position) => (
        <View
          key={position}
          className="gap-2 rounded-2xl border border-line bg-surface-up p-3"
        >
          <View className="flex-row items-center justify-between">
            <Text className="font-body-semibold text-sm text-ink">
              {positionLabel(position)}
            </Text>
            {overallByPosition?.[position] !== undefined ? (
              <Text variant="muted" className="text-xs">
                {overallLabel} {overallByPosition[position]}
              </Text>
            ) : null}
          </View>
          <Stepper
            label={affinityLabel}
            value={value[position] ?? DEFAULT_AFFINITY}
            onChange={(v) => setAffinity(position, v)}
            min={0}
            max={AFFINITY_MAX}
            step={AFFINITY_STEP}
          />
        </View>
      ))}
    </View>
  );
}
