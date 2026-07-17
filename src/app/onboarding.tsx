import { useState } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { ScreenContainer } from "@/components/layout/screen-container";
import { AttributeBudget } from "@/components/players/attribute-budget";
import { PitchAffinity } from "@/components/players/pitch-affinity";
import { SkillPicker } from "@/components/players/skill-picker";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { useUpdateMyPlayer } from "@/hooks/players/use-update-my-player";
import { type AffinityMap, toApiAffinity } from "@/lib/player/affinity";
import { type AttributeMap, baselineAttributeMap } from "@/lib/player/attributes";
import type { SkillKey } from "@/lib/player/skills";

const TOTAL_STEPS = 3;

/**
 * Onboarding do jogador (wizard 3 passos) — abre automaticamente quando o
 * perfil ainda não tem afinidade (ver o gate no root `_layout`). Passo 1
 * (posições) é obrigatório; atributos e skills podem ser pulados. Ao concluir,
 * salva o perfil e o gate redireciona pro app sozinho (afinidade não-vazia).
 */
export default function OnboardingScreen() {
  const { t } = useTranslation("player");
  const updateMyPlayer = useUpdateMyPlayer();

  const [step, setStep] = useState(1);
  const [affinity, setAffinity] = useState<AffinityMap>({});
  const [attributes, setAttributes] = useState<AttributeMap>(baselineAttributeMap());
  const [skills, setSkills] = useState<SkillKey[]>([]);
  const [error, setError] = useState<string | null>(null);

  const hasPosition = Object.keys(affinity).length > 0;

  const finish = async () => {
    setError(null);
    try {
      await updateMyPlayer.mutateAsync({
        affinity: toApiAffinity(affinity),
        attributes,
        skills,
      });
      // Sucesso: o gate no root layout detecta afinidade não-vazia e navega.
    } catch {
      setError(t("onboarding.saveError"));
    }
  };

  const stepTitle =
    step === 1
      ? t("onboarding.step1Title")
      : step === 2
        ? t("onboarding.step2Title")
        : t("onboarding.step3Title");

  return (
    <ScreenContainer className="gap-6">
      <View className="gap-3">
        <Text variant="muted" className="text-xs uppercase tracking-wide">
          {t("onboarding.stepOf", { current: step, total: TOTAL_STEPS })}
        </Text>
        {/* Barra de progresso */}
        <View className="flex-row gap-2">
          {Array.from({ length: TOTAL_STEPS }, (_, i) => (
            <View
              key={i}
              className={`h-1.5 flex-1 rounded-full ${i < step ? "bg-primary" : "bg-line"}`}
            />
          ))}
        </View>
        <Text variant="display" className="text-3xl">
          {stepTitle}
        </Text>
      </View>

      {step === 1 ? (
        <View className="gap-2">
          <Text variant="muted" className="text-sm">
            {t("positions.hint")}
          </Text>
          <PitchAffinity value={affinity} onChange={setAffinity} />
          {!hasPosition ? (
            <Text className="text-center font-body text-xs text-muted">
              {t("onboarding.needPosition")}
            </Text>
          ) : null}
        </View>
      ) : null}

      {step === 2 ? (
        <View className="gap-2">
          <Text variant="muted" className="text-sm">
            {t("attributes.hint")}
          </Text>
          <AttributeBudget value={attributes} onChange={setAttributes} />
        </View>
      ) : null}

      {step === 3 ? (
        <View className="gap-2">
          <Text variant="muted" className="text-sm">
            {t("skills.hint", { max: 3 })}
          </Text>
          <SkillPicker value={skills} onChange={setSkills} />
        </View>
      ) : null}

      {error ? (
        <Text className="font-body text-sm text-danger" accessibilityRole="alert">
          {error}
        </Text>
      ) : null}

      {/* Navegação */}
      <View className="flex-row items-center gap-3">
        {step > 1 ? (
          <Button variant="secondary" className="flex-1" onPress={() => setStep(step - 1)}>
            {t("onboarding.back")}
          </Button>
        ) : null}

        {step > 1 ? (
          <Button
            variant="ghost"
            className="flex-1"
            onPress={() => void finish()}
            loading={updateMyPlayer.isPending}
          >
            {t("onboarding.skip")}
          </Button>
        ) : null}

        {step < TOTAL_STEPS ? (
          <Button
            className="flex-1"
            disabled={step === 1 && !hasPosition}
            onPress={() => setStep(step + 1)}
          >
            {t("onboarding.continue")}
          </Button>
        ) : (
          <Button
            className="flex-1"
            onPress={() => void finish()}
            loading={updateMyPlayer.isPending}
          >
            {t("onboarding.finish")}
          </Button>
        )}
      </View>
    </ScreenContainer>
  );
}
