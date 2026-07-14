import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { asZodMessageKey } from "@/lib/i18n/zod-message";
import { signInSchema, type SignInFormValues } from "@/schemas/auth/sign-in.schema";

export type SignInFormProps = {
  onSubmit: (values: SignInFormValues) => Promise<void>;
  submitting?: boolean;
  formError?: string | null;
};

export function SignInForm({ onSubmit, submitting = false, formError }: SignInFormProps) {
  const { t } = useTranslation(["auth", "zod"]);
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInFormValues>({
    resolver: standardSchemaResolver(signInSchema),
    defaultValues: { email: "", password: "" },
  });

  return (
    <View className="gap-4">
      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, onBlur, value } }) => (
          <Input
            label={t("auth:signIn.emailLabel")}
            placeholder={t("auth:signIn.emailPlaceholder")}
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
            label={t("auth:signIn.passwordLabel")}
            placeholder={t("auth:signIn.passwordPlaceholder")}
            secureTextEntry
            autoCapitalize="none"
            autoComplete="password"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.password ? t(asZodMessageKey(errors.password.message)) : undefined}
          />
        )}
      />
      {formError ? (
        <Text className="font-body text-sm text-danger" accessibilityRole="alert">
          {formError}
        </Text>
      ) : null}
      <Button onPress={handleSubmit((values) => onSubmit(values))} loading={submitting}>
        {submitting ? t("auth:signIn.submitting") : t("auth:signIn.submit")}
      </Button>
    </View>
  );
}
