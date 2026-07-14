import DateTimePicker, { type DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useState } from "react";
import { Platform, Pressable, View } from "react-native";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";

export type DateTimeFieldProps = {
  label: string;
  value: Date;
  mode: "date" | "time";
  onChange: (value: Date) => void;
  className?: string;
  testID?: string;
};

/**
 * Campo de data/horário — abre o picker nativo (`@react-native-community/datetimepicker`)
 * sob demanda. Um único componente cobre os dois modos usados no form de
 * criar pelada (`mode="date"` e `mode="time"` — dois campos separados,
 * combinados em `combineDateAndTime` no submit).
 */
export function DateTimeField({ label, value, mode, onChange, className, testID }: DateTimeFieldProps) {
  const [show, setShow] = useState(false);

  const displayText =
    mode === "date"
      ? format(value, "dd/MM/yyyy", { locale: ptBR })
      : format(value, "HH:mm", { locale: ptBR });

  const handleChange = (event: DateTimePickerEvent, selected?: Date) => {
    if (event.type === "dismissed") {
      setShow(false);
      return;
    }
    if (selected) onChange(selected);
    // Android: o picker é um diálogo que se fecha sozinho após a escolha.
    // iOS: o spinner (`display="spinner"`) é inline e dispara `set` a cada tick
    // do scroll — fechar aqui abortaria a rolagem; mantemos aberto e o usuário
    // fecha tocando no campo de novo (o Pressable faz toggle).
    if (Platform.OS !== "ios") setShow(false);
  };

  return (
    <View className={cn("flex-1 gap-1.5", className)}>
      <Text className="font-body-medium text-sm text-muted">{label}</Text>
      <Pressable
        testID={testID}
        accessibilityRole="button"
        accessibilityLabel={label}
        onPress={() => setShow((prev) => !prev)}
        className="min-h-[44px] justify-center rounded-xl border border-line bg-surface px-4 py-3"
      >
        <Text className="font-body text-base text-ink">{displayText}</Text>
      </Pressable>
      {show ? (
        <DateTimePicker
          value={value}
          mode={mode}
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={handleChange}
        />
      ) : null}
    </View>
  );
}
