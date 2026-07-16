import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { Input } from "@/components/ui/input";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { Stepper } from "@/components/ui/stepper";
import { Text } from "@/components/ui/text";
import { asZodMessageKey } from "@/lib/i18n/zod-message";
import { formatCentsToBRL } from "@/lib/money";
import { POSITIONS, type Position, positionAbbreviation, positionLabel } from "@/lib/player/position";
import { BILLING_MODES, memberFormSchema, type MemberFormValues } from "@/schemas/members/member-form.schema";

export type MemberFormMode = "create" | "edit";

export type MemberFormProps = {
  mode: MemberFormMode;
  defaultValues: MemberFormValues;
  onSubmit: (values: MemberFormValues) => Promise<void>;
  submitting?: boolean;
  formError?: string | null;
  /** Mensalidade padrão do grupo (centavos) — usada como placeholder do override, modo `edit`. */
  groupMonthlyFeeCents?: number | null;
};

const PRIMARY_POS_OPTIONS = POSITIONS.map((position) => ({
  label: positionAbbreviation(position),
  value: position,
}));

const AFFINITY_MAX = 100;
const AFFINITY_STEP = 5;

/**
 * Form de jogador — compartilhado entre "Adicionar jogador" (`mode="create"`)
 * e "Editar jogador" (`mode="edit"`). A API (`PATCH .../members/:memberId`)
 * só aceita `primaryPos`/`secondaryPos`/`affinity`/`seedOverall` — por isso,
 * no modo `edit`, nome/telefone aparecem como texto (não editáveis) em vez de
 * `Input`s que dariam a entender que podem ser salvos.
 */
export function MemberForm({
  mode,
  defaultValues,
  onSubmit,
  submitting = false,
  formError,
  groupMonthlyFeeCents,
}: MemberFormProps) {
  const { t } = useTranslation(["groups", "zod"]);
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<MemberFormValues>({
    resolver: standardSchemaResolver(memberFormSchema),
    defaultValues,
  });

  // eslint-disable-next-line react-hooks/incompatible-library -- watch() do RHF não é memoizável pelo React Compiler; comportamento esperado dessa lib.
  const primaryPos = watch("primaryPos");
  const secondaryPos = watch("secondaryPos");
  const billingMode = watch("billingMode");

  const billingModeOptions = BILLING_MODES.map((value) => ({
    label: t(`groups:member.billingMode.${value}`),
    value,
  }));

  const feeOverridePlaceholder =
    groupMonthlyFeeCents != null
      ? t("groups:member.feeOverridePlaceholderDefault", { amount: formatCentsToBRL(groupMonthlyFeeCents) })
      : t("groups:member.feeOverridePlaceholderNone");

  const activePositions = useMemo(
    () => Array.from(new Set<Position>([primaryPos, ...secondaryPos])),
    [primaryPos, secondaryPos],
  );

  const secondaryOptions = POSITIONS.filter((position) => position !== primaryPos);

  const handlePrimaryChange = (next: Position) => {
    setValue("primaryPos", next);
    if (secondaryPos.includes(next)) {
      setValue(
        "secondaryPos",
        secondaryPos.filter((position) => position !== next),
      );
    }
  };

  const toggleSecondary = (position: Position) => {
    const next = secondaryPos.includes(position)
      ? secondaryPos.filter((p) => p !== position)
      : [...secondaryPos, position];
    setValue("secondaryPos", next);
  };

  return (
    <View className="gap-5">
      {mode === "create" ? (
        <View className="gap-4">
          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label={t("groups:member.nameLabel")}
                placeholder={t("groups:member.namePlaceholder")}
                autoComplete="name"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.name ? t(asZodMessageKey(errors.name.message)) : undefined}
              />
            )}
          />
          <Controller
            control={control}
            name="phone"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label={t("groups:member.phoneLabel")}
                placeholder={t("groups:member.phonePlaceholder")}
                autoComplete="tel"
                keyboardType="phone-pad"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.phone ? t(asZodMessageKey(errors.phone.message)) : undefined}
              />
            )}
          />
        </View>
      ) : (
        <View className="gap-1">
          <Text className="font-body-medium text-sm text-muted">{t("groups:member.nameLabel")}</Text>
          <Text className="font-body-semibold text-base text-ink">{defaultValues.name}</Text>
          <Text variant="muted" className="text-xs">
            {t("groups:member.nameReadOnlyHint")}
          </Text>
        </View>
      )}

      <View className="gap-1.5">
        <Text className="font-body-medium text-sm text-muted">{t("groups:member.primaryPosLabel")}</Text>
        <SegmentedControl options={PRIMARY_POS_OPTIONS} value={primaryPos} onChange={handlePrimaryChange} />
      </View>

      <View className="gap-1.5">
        <Text className="font-body-medium text-sm text-muted">{t("groups:member.secondaryPosLabel")}</Text>
        <View className="flex-row flex-wrap gap-2">
          {secondaryOptions.map((position) => (
            <Chip
              key={position}
              label={positionLabel(position)}
              selected={secondaryPos.includes(position)}
              onPress={() => toggleSecondary(position)}
              accessibilityLabel={positionLabel(position)}
            />
          ))}
        </View>
      </View>

      <View className="gap-3">
        {activePositions.map((position) => (
          <View key={position} className="gap-3 rounded-2xl border border-line bg-surface-up p-3">
            <Text className="font-body-semibold text-sm text-ink">{positionLabel(position)}</Text>
            <Controller
              control={control}
              name={`affinity.${position}`}
              render={({ field: { onChange, value } }) => (
                <Stepper
                  label={t("groups:member.affinityLabel")}
                  value={value}
                  onChange={onChange}
                  min={0}
                  max={AFFINITY_MAX}
                  step={AFFINITY_STEP}
                />
              )}
            />
            <Controller
              control={control}
              name={`seedOverall.${position}`}
              render={({ field: { onChange, value } }) => (
                <Stepper
                  label={t("groups:member.overallLabel")}
                  value={value}
                  onChange={onChange}
                  min={0}
                  max={99}
                />
              )}
            />
          </View>
        ))}
      </View>

      {mode === "edit" ? (
        <View className="gap-3 rounded-2xl border border-line bg-surface-up p-3">
          <Text className="font-body-semibold text-sm text-ink">{t("groups:member.billingSectionTitle")}</Text>
          <View className="gap-1.5">
            <Text className="font-body-medium text-sm text-muted">{t("groups:member.billingModeLabel")}</Text>
            <SegmentedControl
              options={billingModeOptions}
              value={billingMode}
              onChange={(next) => setValue("billingMode", next)}
            />
          </View>
          {billingMode === "mensalista" ? (
            <Controller
              control={control}
              name="monthlyFeeCentsOverrideInput"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label={t("groups:member.feeOverrideLabel")}
                  placeholder={feeOverridePlaceholder}
                  helperText={t("groups:member.feeOverrideHint")}
                  keyboardType="decimal-pad"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                />
              )}
            />
          ) : null}
        </View>
      ) : null}

      {formError ? (
        <Text className="font-body text-sm text-danger" accessibilityRole="alert">
          {formError}
        </Text>
      ) : null}

      <Button
        testID="member-form-submit"
        onPress={handleSubmit((values) => onSubmit(values))}
        loading={submitting}
      >
        {mode === "create"
          ? submitting
            ? t("groups:member.submitAdding")
            : t("groups:member.submitAdd")
          : submitting
            ? t("groups:member.submitEditing")
            : t("groups:member.submitEdit")}
      </Button>
    </View>
  );
}
