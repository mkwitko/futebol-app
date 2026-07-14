import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { asZodMessageKey } from "@/lib/i18n/zod-message";
import { createGroupSchema, type CreateGroupFormValues } from "@/schemas/groups/create-group.schema";

export type CreateGroupFormProps = {
  onSubmit: (values: CreateGroupFormValues) => Promise<void>;
  submitting?: boolean;
  formError?: string | null;
};

/**
 * `statsMode` fica fixo em `organizador` (não exposto aqui) — o modo
 * colaborativo entra em uma fase futura do produto.
 */
export function CreateGroupForm({ onSubmit, submitting = false, formError }: CreateGroupFormProps) {
  const { t } = useTranslation(["groups", "zod"]);
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateGroupFormValues>({
    resolver: standardSchemaResolver(createGroupSchema),
    defaultValues: { name: "" },
  });

  return (
    <View className="gap-4">
      <Controller
        control={control}
        name="name"
        render={({ field: { onChange, onBlur, value } }) => (
          <Input
            label={t("groups:create.nameLabel")}
            placeholder={t("groups:create.namePlaceholder")}
            autoFocus
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.name ? t(asZodMessageKey(errors.name.message)) : undefined}
          />
        )}
      />
      {formError ? (
        <Text className="font-body text-sm text-danger" accessibilityRole="alert">
          {formError}
        </Text>
      ) : null}
      <Button
        testID="create-group-submit"
        onPress={handleSubmit((values) => onSubmit(values))}
        loading={submitting}
      >
        {submitting ? t("groups:create.submitting") : t("groups:create.submit")}
      </Button>
    </View>
  );
}
