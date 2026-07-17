import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { Chip } from "@/components/ui/chip";
import { Text } from "@/components/ui/text";
import {
  MAX_SKILLS,
  SKILL_CATEGORY_LABELS,
  skillLabel,
  type SkillKey,
  skillsByCategory,
} from "@/lib/player/skills";

export type SkillPickerProps = {
  value: SkillKey[];
  onChange: (next: SkillKey[]) => void;
};

/**
 * Seletor de habilidades/playstyles agrupadas por categoria (até `MAX_SKILLS`).
 * Toca pra alternar; ao atingir o limite, os não-selecionados desabilitam.
 */
export function SkillPicker({ value, onChange }: SkillPickerProps) {
  const { t } = useTranslation("player");
  const atLimit = value.length >= MAX_SKILLS;

  const toggle = (skill: SkillKey) => {
    if (value.includes(skill)) onChange(value.filter((s) => s !== skill));
    else if (!atLimit) onChange([...value, skill]);
  };

  return (
    <View className="gap-4">
      <Text variant="muted" className="text-sm">
        {t("skills.counter", { count: value.length, max: MAX_SKILLS })}
      </Text>
      {skillsByCategory().map(({ category, skills }) => (
        <View key={category} className="gap-2">
          <Text variant="muted" className="text-xs uppercase tracking-wide">
            {SKILL_CATEGORY_LABELS[category]}
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {skills.map((skill) => {
              const selected = value.includes(skill);
              return (
                <Chip
                  key={skill}
                  label={skillLabel(skill)}
                  selected={selected}
                  disabled={!selected && atLimit}
                  onPress={() => toggle(skill)}
                />
              );
            })}
          </View>
        </View>
      ))}
    </View>
  );
}
