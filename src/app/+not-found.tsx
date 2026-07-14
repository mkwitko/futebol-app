import { Link, Stack } from "expo-router";
import { View } from "react-native";
import { Text } from "@/components/ui/text";

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Oops!" }} />
      <View className="flex-1 items-center justify-center gap-4 bg-bg p-6">
        <Text variant="display" className="text-xl">
          Essa tela não existe.
        </Text>
        <Link href="/">
          <Text className="font-body-semibold text-primary">Voltar ao início</Text>
        </Link>
      </View>
    </>
  );
}
