import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { asZodMessageKey } from "@/lib/i18n/zod-message";
import { subscribeSchema, type SubscribeFormValues } from "@/schemas/billing/subscribe.schema";

export type SubscribeFormProps = {
  onSubmit: (values: SubscribeFormValues) => Promise<void>;
  submitting?: boolean;
  formError?: string | null;
};

/**
 * CPF + telefone pra assinar via Woovi PIX Automático (`POST
 * /billing/subscribe`). O CPF aceita máscara opcional — a validação
 * (`subscribeSchema`) só confere os 11 dígitos limpos.
 */
export function SubscribeForm({ onSubmit, submitting = false, formError }: SubscribeFormProps) {
  const { t } = useTranslation(["billing", "zod"]);
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SubscribeFormValues>({
    resolver: standardSchemaResolver(subscribeSchema),
    defaultValues: { taxId: "", phone: "" },
  });

  return (
    <View className="gap-4">
      <Controller
        control={control}
        name="taxId"
        render={({ field: { onChange, onBlur, value } }) => (
          <Input
            label={t("billing:subscribeForm.taxIdLabel")}
            placeholder={t("billing:subscribeForm.taxIdPlaceholder")}
            keyboardType="number-pad"
            autoFocus
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.taxId ? t(asZodMessageKey(errors.taxId.message)) : undefined}
            testID="subscribe-taxid-input"
          />
        )}
      />
      <Controller
        control={control}
        name="phone"
        render={({ field: { onChange, onBlur, value } }) => (
          <Input
            label={t("billing:subscribeForm.phoneLabel")}
            placeholder={t("billing:subscribeForm.phonePlaceholder")}
            keyboardType="phone-pad"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.phone ? t(asZodMessageKey(errors.phone.message)) : undefined}
            testID="subscribe-phone-input"
          />
        )}
      />
      {formError ? (
        <Text className="font-body text-sm text-danger" accessibilityRole="alert">
          {formError}
        </Text>
      ) : null}
      <Button
        testID="subscribe-submit"
        onPress={handleSubmit((values) => onSubmit(values))}
        loading={submitting}
      >
        {t("billing:subscribeForm.submit")}
      </Button>
    </View>
  );
}
