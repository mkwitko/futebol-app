import { Ionicons } from "@expo/vector-icons";
import { forwardRef, useState } from "react";
import { Pressable, TextInput, type TextInputProps, View } from "react-native";
import { cn } from "@/lib/utils";
import { colors } from "@/lib/theme";
import { Text } from "./text";

export type InputProps = TextInputProps & {
  label?: string;
  error?: string;
  helperText?: string;
  /**
   * Mostra um botão de olho (Ionicons `eye`/`eye-off`) que alterna a
   * visibilidade do texto — pro campo de senha. Quando `true`, o componente
   * assume o controle de `secureTextEntry` internamente (o valor passado via
   * prop é ignorado).
   */
  secureToggle?: boolean;
  /**
   * Texto curto exibido DENTRO do input à esquerda (ex.: "R$"). Útil pra
   * máscaras de moeda. Tem padding à esquerda e dispara `paddingLeft: 0` no
   * `TextInput` (a posição do texto começa depois do prefixo).
   */
  prefix?: string;
};

/** Campo de texto do app — label, erro (RHF-friendly) e anel de foco visível. */
export const Input = forwardRef<TextInput, InputProps>(function Input(
  { label, error, helperText, className, onFocus, onBlur, secureToggle = false, secureTextEntry, prefix, ...props },
  ref,
) {
  const [focused, setFocused] = useState(false);
  // Só relevante quando `secureToggle` — começa oculto, como um campo de senha normal.
  const [hidden, setHidden] = useState(true);
  const hasPrefix = Boolean(prefix);

  return (
    <View className="gap-1.5">
      {label ? (
        <Text className="font-body-medium text-sm text-muted">{label}</Text>
      ) : null}
      <View className="relative">
        <TextInput
          ref={ref}
          placeholderTextColor={colors.muted}
          accessibilityLabel={label}
          secureTextEntry={secureToggle ? hidden : secureTextEntry}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          className={cn(
            "min-h-[44px] rounded-xl border border-line bg-surface px-4 py-3 font-body text-base text-ink",
            hasPrefix && "pl-11",
            secureToggle && "pr-12",
            focused && "border-primary",
            error && "border-danger",
            className,
          )}
          {...props}
        />
        {hasPrefix ? (
          // Renderizado DEPOIS do TextInput (mesmo pai relativo) pra ficar por
          // cima do bg opaco dele — senão o input cobre o prefixo. `none` deixa
          // o toque passar direto pro TextInput.
          <Text
            pointerEvents="none"
            className="absolute left-4 top-0 h-full font-body-medium text-base text-ink"
            style={{ lineHeight: 44 }}
          >
            {prefix}
          </Text>
        ) : null}
        {secureToggle ? (
          <Pressable
            onPress={() => setHidden((prev) => !prev)}
            accessibilityRole="button"
            // Rótulo descreve a ação disponível (como o `Stepper`) — "Mostrar"
            // quando o olho aberto revela, "Ocultar" quando já revelado.
            accessibilityLabel={hidden ? "Mostrar senha" : "Ocultar senha"}
            hitSlop={8}
            className="absolute right-3 top-0 h-full items-center justify-center"
          >
            <Ionicons name={hidden ? "eye" : "eye-off"} size={20} color={colors.muted} />
          </Pressable>
        ) : null}
      </View>
      {error ? (
        <Text className="font-body text-sm text-danger" accessibilityRole="alert">
          {error}
        </Text>
      ) : helperText ? (
        <Text className="font-body text-sm text-muted">{helperText}</Text>
      ) : null}
    </View>
  );
});
