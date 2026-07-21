import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { Controller, useForm, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LocationPicker } from "@/components/location/location-picker";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { Stepper } from "@/components/ui/stepper";
import { Text } from "@/components/ui/text";
import { MODALITIES, modalityLabel } from "@/lib/player/position";
import { combineDateAndTime } from "@/lib/datetime/format";
import { maskBRLInput } from "@/lib/money";
import { asZodMessageKey } from "@/lib/i18n/zod-message";
import {
  createMatchSchema,
  defaultCreateMatchFormValues,
  MAX_SLOTS,
  MIN_SLOTS,
  type CreateMatchFormValues,
} from "@/schemas/matches/create-match.schema";
import { DateTimeField } from "./date-time-field";
import { RecurrencePicker } from "./recurrence-picker";

export type CreateMatchFormProps = {
  onSubmit: (values: CreateMatchFormValues) => Promise<void>;
  submitting?: boolean;
  formError?: string | null;
};

/** Form de criar pelada — data/horário, local, vagas, preço, PIX e recorrência semanal. */
export function CreateMatchForm({ onSubmit, submitting = false, formError }: CreateMatchFormProps) {
  const { t } = useTranslation(["matches", "zod"]);
  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<CreateMatchFormValues>({
    resolver: standardSchemaResolver(createMatchSchema),
    defaultValues: defaultCreateMatchFormValues(),
  });

  const watchedDate = useWatch({ control, name: "date" });
  const watchedTime = useWatch({ control, name: "time" });
  const baseDatetime = combineDateAndTime(watchedDate, watchedTime);

  // Geo é um grupo de 4 campos (lat/lng/city/address) editados juntos pelo
  // LocationPicker — observamos os 4 e setamos os 4 de uma vez no onChange.
  const geo = useWatch({ control, name: ["latitude", "longitude", "city", "address"] });
  const geoValue = {
    latitude: geo[0] ?? null,
    longitude: geo[1] ?? null,
    city: geo[2] ?? null,
    address: geo[3] ?? null,
  };

  return (
    <View className="gap-4">
      <View className="flex-row gap-3">
        <Controller
          control={control}
          name="date"
          render={({ field: { onChange, value } }) => (
            <DateTimeField
              label={t("matches:create.dateLabel")}
              mode="date"
              value={value}
              onChange={onChange}
              testID="create-match-date"
            />
          )}
        />
        <Controller
          control={control}
          name="time"
          render={({ field: { onChange, value } }) => (
            <DateTimeField
              label={t("matches:create.timeLabel")}
              mode="time"
              value={value}
              onChange={onChange}
              testID="create-match-time"
            />
          )}
        />
      </View>

      <Controller
        control={control}
        name="location"
        render={({ field: { onChange, onBlur, value } }) => (
          <Input
            label={t("matches:create.locationLabel")}
            placeholder={t("matches:create.locationPlaceholder")}
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.location ? t(asZodMessageKey(errors.location.message)) : undefined}
          />
        )}
      />

      <View className="gap-2">
        <Text className="font-body-medium text-sm text-muted">
          {t("matches:create.geoLabel")}
        </Text>
        <Text className="font-body text-xs text-muted">{t("matches:create.geoHint")}</Text>
        <LocationPicker
          value={geoValue}
          onChange={(next) => {
            setValue("latitude", next.latitude);
            setValue("longitude", next.longitude);
            setValue("city", next.city);
            setValue("address", next.address);
          }}
        />
      </View>

      <Controller
        control={control}
        name="modality"
        render={({ field: { onChange, value } }) => (
          <View className="gap-2">
            <Text className="font-body-medium text-sm text-muted">
              {t("matches:create.modalityLabel")}
            </Text>
            <SegmentedControl
              options={MODALITIES.map((m) => ({ label: modalityLabel(m), value: m }))}
              value={value}
              onChange={onChange}
            />
          </View>
        )}
      />

      <Controller
        control={control}
        name="slots"
        render={({ field: { onChange, value } }) => (
          <Stepper
            label={t("matches:create.slotsLabel")}
            value={value}
            onChange={onChange}
            min={MIN_SLOTS}
            max={MAX_SLOTS}
          />
        )}
      />

      <Controller
        control={control}
        name="priceInput"
        render={({ field: { onChange, onBlur, value } }) => (
          <Input
            label={t("matches:create.priceLabel")}
            placeholder={t("matches:create.pricePlaceholder")}
            helperText={t("matches:create.priceHelper")}
            prefix="R$"
            keyboardType="number-pad"
            value={value ?? ""}
            onChangeText={(text) => onChange(maskBRLInput(text))}
            onBlur={onBlur}
          />
        )}
      />

      <Controller
        control={control}
        name="pixKey"
        render={({ field: { onChange, onBlur, value } }) => (
          <Input
            label={t("matches:create.pixKeyLabel")}
            placeholder={t("matches:create.pixKeyPlaceholder")}
            autoCapitalize="none"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.pixKey ? t(asZodMessageKey(errors.pixKey.message)) : undefined}
          />
        )}
      />

      <Controller
        control={control}
        name="recurrence"
        render={({ field: { onChange, value } }) => (
          <RecurrencePicker value={value} onChange={onChange} baseDatetime={baseDatetime} />
        )}
      />

      {formError ? (
        <Text className="font-body text-sm text-danger" accessibilityRole="alert">
          {formError}
        </Text>
      ) : null}

      <Button
        testID="create-match-submit"
        onPress={handleSubmit((values) => onSubmit(values))}
        loading={submitting}
      >
        {submitting ? t("matches:create.submitting") : t("matches:create.submit")}
      </Button>
    </View>
  );
}
