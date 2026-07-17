import { useState } from "react";
import { useTranslation } from "react-i18next";
import { type DimensionValue, Pressable, View } from "react-native";
import { Chip } from "@/components/ui/chip";
import { Text } from "@/components/ui/text";
import {
  AFFINITY_GRADES,
  type AffinityGradeToken,
  type AffinityMap,
  cycleAffinity,
  gradeFor,
} from "@/lib/player/affinity";
import {
  type FieldPosition,
  fieldPositionAbbreviation,
  fieldPositionLabel,
  type Modality,
  MODALITIES,
  MODALITY_POSITIONS,
  modalityLabel,
} from "@/lib/player/position";
import { colors, gradeColor } from "@/lib/theme";

/** Onde cada posição fica no campinho (% do container, atacando pra cima), por modalidade. */
const POSITION_SPOTS: Record<FieldPosition, { left: DimensionValue; top: DimensionValue }> = {
  // FUTSAL (quadra, 4 de linha: fixo, 2 alas, pivô)
  futsal_goleiro: { left: "50%", top: "90%" },
  futsal_fixo: { left: "50%", top: "68%" },
  futsal_ala_esq: { left: "24%", top: "44%" },
  futsal_ala_dir: { left: "76%", top: "44%" },
  futsal_pivo: { left: "50%", top: "15%" },
  // SOCIETY 7
  society_goleiro: { left: "50%", top: "91%" },
  society_zagueiro: { left: "50%", top: "73%" },
  society_lateral_esq: { left: "20%", top: "68%" },
  society_lateral_dir: { left: "80%", top: "68%" },
  society_volante: { left: "50%", top: "54%" },
  society_meia: { left: "50%", top: "38%" },
  society_ala_esq: { left: "22%", top: "34%" },
  society_ala_dir: { left: "78%", top: "34%" },
  society_atacante: { left: "50%", top: "14%" },
  // CAMPO 11
  campo_goleiro: { left: "50%", top: "93%" },
  campo_zagueiro: { left: "50%", top: "78%" },
  campo_lateral_esq: { left: "18%", top: "74%" },
  campo_lateral_dir: { left: "82%", top: "74%" },
  campo_volante: { left: "50%", top: "60%" },
  campo_meia_esq: { left: "24%", top: "48%" },
  campo_meia: { left: "50%", top: "46%" },
  campo_meia_dir: { left: "76%", top: "48%" },
  campo_camisa10: { left: "50%", top: "31%" },
  campo_ponta_esq: { left: "20%", top: "16%" },
  campo_atacante: { left: "50%", top: "13%" },
  campo_ponta_dir: { left: "80%", top: "16%" },
};

/** Chaves i18n literais por grau (o `t` do i18next só aceita chaves conhecidas). */
const GRADE_LABEL_KEY: Record<AffinityGradeToken, "grades.natural" | "grades.bom" | "grades.ok" | "grades.fraco"> = {
  natural: "grades.natural",
  bom: "grades.bom",
  ok: "grades.ok",
  fraco: "grades.fraco",
};

const MARKER = 54;

export type PitchAffinityProps = {
  value: AffinityMap;
  onChange: (next: AffinityMap) => void;
};

/**
 * Campinho estilo Football Manager: escolhe a modalidade (Futsal / Futebol 7 /
 * Futebol 11) nos chips do topo; cada modalidade tem seu próprio layout de
 * posições. Tocar num marcador cicla o grau de afinidade (vazio → Natural →
 * Bom → Ok → Fraco → vazio). O mapa de afinidade é único e guarda as posições
 * de todas as modalidades declaradas.
 */
export function PitchAffinity({ value, onChange }: PitchAffinityProps) {
  const { t } = useTranslation("player");
  const [modality, setModality] = useState<Modality>("campo");

  const handleTap = (position: FieldPosition) => {
    const next = cycleAffinity(value[position]);
    const draft: AffinityMap = { ...value };
    if (next === undefined) delete draft[position];
    else draft[position] = next;
    onChange(draft);
  };

  return (
    <View className="gap-4">
      {/* Seletor de modalidade */}
      <View className="flex-row flex-wrap justify-center gap-2">
        {MODALITIES.map((m) => (
          <Chip
            key={m}
            label={modalityLabel(m)}
            selected={m === modality}
            onPress={() => setModality(m)}
            accessibilityLabel={modalityLabel(m)}
          />
        ))}
      </View>

      {/* Campo — proporção retrato, linhas brancas sutis sobre o gramado. */}
      <View
        className="w-full self-center overflow-hidden rounded-2xl border border-line"
        style={{ aspectRatio: 0.66, backgroundColor: "#0E3B24" }}
      >
        {/* Linha do meio + círculo central */}
        <View className="absolute left-0 right-0 border-t border-white/20" style={{ top: "50%" }} />
        <View
          className="absolute rounded-full border border-white/20"
          style={{ width: "34%", aspectRatio: 1, left: "33%", top: "50%", marginTop: "-17%" }}
        />
        {/* Grandes áreas (topo e base) */}
        <View
          className="absolute border border-white/20"
          style={{ width: "54%", height: "16%", left: "23%", top: 0 }}
        />
        <View
          className="absolute border border-white/20"
          style={{ width: "54%", height: "16%", left: "23%", bottom: 0 }}
        />

        {MODALITY_POSITIONS[modality].map((position) => {
          const spot = POSITION_SPOTS[position];
          const affinity = value[position];
          const grade = gradeFor(affinity);
          const fill = grade ? gradeColor(grade.token) : "transparent";
          const active = grade !== undefined;
          return (
            <Pressable
              key={position}
              accessibilityRole="button"
              accessibilityLabel={`${fieldPositionLabel(position)}${
                grade ? `: ${t(GRADE_LABEL_KEY[grade.token])}` : ""
              }`}
              onPress={() => handleTap(position)}
              className="absolute items-center justify-center rounded-full border-2 active:opacity-80"
              style={{
                width: MARKER,
                height: MARKER,
                left: spot.left,
                top: spot.top,
                marginLeft: -MARKER / 2,
                marginTop: -MARKER / 2,
                backgroundColor: active ? fill : "rgba(255,255,255,0.08)",
                borderColor: active ? fill : "rgba(255,255,255,0.35)",
              }}
            >
              <Text
                className="font-display-bold text-sm"
                style={{ color: active ? colors.bg : colors.ink }}
              >
                {fieldPositionAbbreviation(position)}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Legenda dos graus */}
      <View className="flex-row flex-wrap items-center justify-center gap-x-4 gap-y-2">
        {AFFINITY_GRADES.map((grade) => (
          <View key={grade.token} className="flex-row items-center gap-1.5">
            <View
              className="rounded-full"
              style={{ width: 12, height: 12, backgroundColor: gradeColor(grade.token) }}
            />
            <Text variant="muted" className="text-xs">
              {t(GRADE_LABEL_KEY[grade.token])}
            </Text>
          </View>
        ))}
        <View className="flex-row items-center gap-1.5">
          <View
            className="rounded-full border"
            style={{ width: 12, height: 12, borderColor: "rgba(255,255,255,0.35)" }}
          />
          <Text variant="muted" className="text-xs">
            {t("grades.none")}
          </Text>
        </View>
      </View>
    </View>
  );
}
