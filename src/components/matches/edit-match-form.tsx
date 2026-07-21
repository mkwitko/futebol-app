import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { Controller, useForm, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { LocationPicker } from "@/components/location/location-picker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { Stepper } from "@/components/ui/stepper";
import { Text } from "@/components/ui/text";
import { asZodMessageKey } from "@/lib/i18n/zod-message";
import { maskBRLInput } from "@/lib/money";
import { MODALITIES, modalityLabel } from "@/lib/player/position";
import {
  type EditMatchFormValues,
  editMatchSchema,
} from "@/schemas/matches/edit-match.schema";
import { MAX_SLOTS, MIN_SLOTS } from "@/schemas/matches/create-match.schema";
import { DateTimeField } from "./date-time-field";

export type EditMatchFormProps = {
  initialValues: EditMatchFormValues;
  onSubmit: (values: EditMatchFormValues) => Promise<void>;
  submitting?: boolean;
  formError?: string | null;
  /** Mostra o aviso de que editar desacopla esta pelada da recorrência. */
  detachesFromSeries?: boolean;
};

/** Form de editar pelada — mesmos campos da criação, sem recorrência. */
export function EditMatchForm({
  initialValues,
  onSubmit,
  submitting = false,
  formError,
  detachesFromSeries = false,
}: EditMatchFormProps) {
  const { t } = useTranslation(["matches", "zod"]);
  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<EditMatchFormValues>({
    resolver: standardSchemaResolver(editMatchSchema),
    defaultValues: initialValues,
  });

  const geo = useWatch({ control, name: ["latitude", "longitude", "city", "address"] });
  const geoValue = {
    latitude: geo[0] ?? null,
    longitude: geo[1] ?? null,
    city: geo[2] ?? null,
    address: geo[3] ?? null,
  };

  return (
    <View className="gap-4">
      {detachesFromSeries ? (
        <View className="rounded-2xl border border-line bg-surface-up p-3">
          <Text className="font-body text-sm text-muted" testID="edit-match-series-note">
            {t("matches:edit.seriesDetachNote")}
          </Text>
        </View>
      ) : null}

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
              testID="edit-match-date"
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
              testID="edit-match-time"
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
        <Text className="font-body-medium text-sm text-muted">{t("matches:create.geoLabel")}</Text>
        <Text className="font-body text-xs text-muted">{t("matches:create.geoHint")}</Text>
        <LocationPicker
          value={geoValue}
          onChange={(next) => {
            setValue("latitude", next.latitude);
            setValue("longitude", next.longitude, { shouldValidate: true });
            setValue("city", next.city);
            setValue("address", next.address);
          }}
        />
        {errors.latitude ? (
          <Text className="font-body text-xs text-danger" testID="edit-match-geo-error">
            {t("matches:create.geoRequired")}
          </Text>
        ) : null}
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

      {formError ? (
        <Text className="font-body text-sm text-danger" accessibilityRole="alert">
          {formError}
        </Text>
      ) : null}

      <Button
        testID="edit-match-submit"
        onPress={handleSubmit((values) => onSubmit(values))}
        loading={submitting}
      >
        {submitting ? t("matches:edit.submitting") : t("matches:edit.submit")}
      </Button>
    </View>
  );
}
