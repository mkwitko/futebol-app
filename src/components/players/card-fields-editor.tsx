import { useState } from "react";
import { Pressable, View } from "react-native";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { Text } from "@/components/ui/text";

export type Foot = "left" | "right" | "both";

export type CardFieldsValue = {
  dominantFoot: Foot | null;
  weakFoot: number | null;
  skillMoves: number | null;
  heightCm: number | null;
  weightKg: number | null;
  birthYear: number | null;
  preferredTeam: string | null;
  nationality: string | null;
};

export type CardFieldsEditorProps = {
  initial: CardFieldsValue;
  onSave: (value: CardFieldsValue) => Promise<unknown>;
  saving?: boolean;
  saveLabel: string;
};

const FOOT_OPTIONS: { label: string; value: Foot }[] = [
  { label: "Esquerda", value: "left" },
  { label: "Direita", value: "right" },
  { label: "Ambas", value: "both" },
];

/** Fileira de 1-5 estrelas selecionáveis (toca a n-ésima pra definir; toca a atual pra limpar). */
function StarRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number | null;
  onChange: (v: number | null) => void;
}) {
  return (
    <View className="gap-1.5">
      <Text className="font-body-medium text-sm text-muted">{label}</Text>
      <View className="flex-row gap-2">
        {[1, 2, 3, 4, 5].map((n) => (
          <Pressable
            key={n}
            accessibilityRole="button"
            accessibilityLabel={`${label}: ${n}`}
            onPress={() => onChange(value === n ? null : n)}
            className="h-10 w-10 items-center justify-center rounded-lg bg-surface-up active:opacity-70"
          >
            <Text className="font-display text-xl" style={{ opacity: (value ?? 0) >= n ? 1 : 0.3 }}>
              ★
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

function toIntOrNull(text: string): number | null {
  const n = Number.parseInt(text, 10);
  return Number.isFinite(n) ? n : null;
}

/** Editor dos campos de carta (perna dominante, estrelas, físico, time, nacionalidade). */
export function CardFieldsEditor({ initial, onSave, saving, saveLabel }: CardFieldsEditorProps) {
  const [value, setValue] = useState<CardFieldsValue>(initial);
  const set = <K extends keyof CardFieldsValue>(key: K, v: CardFieldsValue[K]) =>
    setValue((prev) => ({ ...prev, [key]: v }));

  return (
    <View className="gap-4">
      <View className="gap-1.5">
        <Text className="font-body-medium text-sm text-muted">Perna dominante</Text>
        <SegmentedControl
          options={FOOT_OPTIONS}
          value={value.dominantFoot ?? "right"}
          onChange={(v) => set("dominantFoot", v)}
        />
      </View>

      <StarRow label="Perna ruim" value={value.weakFoot} onChange={(v) => set("weakFoot", v)} />
      <StarRow label="Fintas" value={value.skillMoves} onChange={(v) => set("skillMoves", v)} />

      <View className="flex-row gap-3">
        <View className="flex-1">
          <Input
            label="Altura (cm)"
            keyboardType="number-pad"
            value={value.heightCm != null ? String(value.heightCm) : ""}
            onChangeText={(txt) => set("heightCm", toIntOrNull(txt))}
          />
        </View>
        <View className="flex-1">
          <Input
            label="Peso (kg)"
            keyboardType="number-pad"
            value={value.weightKg != null ? String(value.weightKg) : ""}
            onChangeText={(txt) => set("weightKg", toIntOrNull(txt))}
          />
        </View>
      </View>

      <Input
        label="Ano de nascimento"
        keyboardType="number-pad"
        value={value.birthYear != null ? String(value.birthYear) : ""}
        onChangeText={(txt) => set("birthYear", toIntOrNull(txt))}
      />
      <Input
        label="Time do coração"
        value={value.preferredTeam ?? ""}
        onChangeText={(txt) => set("preferredTeam", txt.trim() ? txt : null)}
      />
      <Input
        label="Nacionalidade"
        value={value.nationality ?? ""}
        onChangeText={(txt) => set("nationality", txt.trim() ? txt : null)}
      />

      <Button testID="profile-save-card" onPress={() => void onSave(value)} loading={saving}>
        {saveLabel}
      </Button>
    </View>
  );
}
