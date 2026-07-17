import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { View } from "react-native";
import { colors } from "@/lib/theme";

export type StadiumIntensity = "full" | "subtle";

/**
 * Backdrop de estádio visto de cima. `full` (telas de auth) mantém o estádio
 * bem visível com um gradiente que escurece só topo/base. `subtle` (padrão das
 * telas internas via `ScreenContainer`) borra mais e escurece o todo, virando
 * textura de fundo pros cards de conteúdo lerem por cima sem competir.
 */
export function StadiumBackground({ intensity = "full" }: { intensity?: StadiumIntensity }) {
  const subtle = intensity === "subtle";
  return (
    <View className="flex-1 bg-bg">
      <Image
        source={require("../../../assets/stadium.png")}
        style={{ flex: 1 }}
        contentFit="cover"
        blurRadius={subtle ? 18 : 4}
      />
      <LinearGradient
        pointerEvents="none"
        colors={
          subtle
            ? [`${colors.bg}F2`, `${colors.bg}E6`, `${colors.bg}F2`]
            : [`${colors.bg}CC`, `${colors.bg}22`, `${colors.bg}CC`]
        }
        locations={[0, 0.5, 1]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
      />
    </View>
  );
}
