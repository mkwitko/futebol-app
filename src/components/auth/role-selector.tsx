import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { Chip } from "@/components/ui/chip";
import { Text } from "@/components/ui/text";
import { ROLE_KEYS, type Role } from "@/lib/auth/roles";

export type RoleSelectorProps = {
  value: Role[];
  onChange: (roles: Role[]) => void;
  disabled?: boolean;
  /** Prefixo de testID pros chips (ex.: `register-role`, `profile-role`). */
  testIDPrefix?: string;
};

/**
 * Seletor multi de tipo de conta (jogador/organizador/quadra) — reusado no
 * cadastro e na edição de perfil. Quando `quadra` está marcado, mostra a dica
 * de que a gestão da quadra é feita no site (web), não no app.
 */
export function RoleSelector({ value, onChange, disabled = false, testIDPrefix = "role" }: RoleSelectorProps) {
  const { t } = useTranslation("auth");

  const toggle = (role: Role) => {
    onChange(value.includes(role) ? value.filter((r) => r !== role) : [...value, role]);
  };

  return (
    <View className="gap-2">
      <View className="flex-row flex-wrap gap-2">
        {ROLE_KEYS.map((role) => (
          <Chip
            key={role}
            label={t(`roles.${role}`)}
            selected={value.includes(role)}
            disabled={disabled}
            onPress={() => toggle(role)}
            testID={`${testIDPrefix}-${role}`}
          />
        ))}
      </View>
      {value.includes("quadra") ? (
        <Text variant="muted" className="text-sm" testID={`${testIDPrefix}-quadra-note`}>
          {t("register.quadraNote")}
        </Text>
      ) : null}
    </View>
  );
}
