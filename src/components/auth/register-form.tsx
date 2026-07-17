import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { RoleSelector } from "@/components/auth/role-selector";
import { asZodMessageKey } from "@/lib/i18n/zod-message";
import { DEFAULT_ROLES } from "@/lib/auth/roles";
import { registerSchema, type RegisterFormValues } from "@/schemas/auth/register.schema";

export type RegisterFormProps = {
  onSubmit: (values: RegisterFormValues) => Promise<void>;
  submitting?: boolean;
  formError?: string | null;
};

export function RegisterForm({ onSubmit, submitting = false, formError }: RegisterFormProps) {
  const { t } = useTranslation(["auth", "zod"]);
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: standardSchemaResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "", confirmPassword: "", roles: DEFAULT_ROLES },
  });

  return (
    <View className="gap-4">
      <Controller
        control={control}
        name="name"
        render={({ field: { onChange, onBlur, value } }) => (
          <Input
            label={t("auth:register.nameLabel")}
            placeholder={t("auth:register.namePlaceholder")}
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
        name="email"
        render={({ field: { onChange, onBlur, value } }) => (
          <Input
            label={t("auth:register.emailLabel")}
            placeholder={t("auth:register.emailPlaceholder")}
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.email ? t(asZodMessageKey(errors.email.message)) : undefined}
          />
        )}
      />
      <Controller
        control={control}
        name="password"
        render={({ field: { onChange, onBlur, value } }) => (
          <Input
            label={t("auth:register.passwordLabel")}
            placeholder={t("auth:register.passwordPlaceholder")}
            secureToggle
            autoCapitalize="none"
            autoComplete="password-new"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.password ? t(asZodMessageKey(errors.password.message)) : undefined}
          />
        )}
      />
      <Controller
        control={control}
        name="confirmPassword"
        render={({ field: { onChange, onBlur, value } }) => (
          <Input
            label={t("auth:register.confirmPasswordLabel")}
            placeholder={t("auth:register.confirmPasswordPlaceholder")}
            secureToggle
            autoCapitalize="none"
            autoComplete="password-new"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={
              errors.confirmPassword ? t(asZodMessageKey(errors.confirmPassword.message)) : undefined
            }
          />
        )}
      />
      <Controller
        control={control}
        name="roles"
        render={({ field: { onChange, value } }) => (
          <View className="gap-2">
            <View className="gap-1">
              <Text className="font-body-medium text-sm text-muted">
                {t("auth:register.accountTypeLabel")}
              </Text>
              <Text variant="muted" className="text-xs">
                {t("auth:register.accountTypeHint")}
              </Text>
            </View>
            <RoleSelector value={value} onChange={onChange} testIDPrefix="register-role" />
            {errors.roles ? (
              <Text className="font-body text-sm text-danger">
                {t(asZodMessageKey(errors.roles.message))}
              </Text>
            ) : null}
          </View>
        )}
      />
      {formError ? (
        <Text className="font-body text-sm text-danger" accessibilityRole="alert">
          {formError}
        </Text>
      ) : null}
      <Button onPress={handleSubmit((values) => onSubmit(values))} loading={submitting}>
        {submitting ? t("auth:register.submitting") : t("auth:register.submit")}
      </Button>
    </View>
  );
}
