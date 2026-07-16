import { LinearGradient } from "expo-linear-gradient";
import { View } from "react-native";
import { colors } from "@/lib/theme";

/**
 * Backdrop de tela cheia pras telas de auth — estádio visto de cima, com
 * blur/escurecido (textura sutil, não é o foco da tela; o card por cima
 * fica sempre legível).
 *
 * Slot de asset: quando existir uma foto aérea de estádio/gramado em
 * `assets/stadium.jpg` (ou .png/.webp), troque o `LinearGradient` abaixo por
 * algo como:
 *
 *   import { Image } from "expo-image";
 *   <Image
 *     source={require("../../../assets/stadium.jpg")}
 *     style={{ flex: 1 }}
 *     contentFit="cover"
 *     blurRadius={20} // expo-image já suporta blur nativo — sem precisar de expo-blur (não é dependência do projeto)
 *   />
 *
 * Sem o asset ainda, caímos num gradiente verde-gramado → preto como
 * placeholder — nunca quebra o build por falta de arquivo.
 */
export function StadiumBackground() {
  return (
    <View className="flex-1 bg-bg">
      <LinearGradient
        colors={[`${colors.primary}29`, colors.surface, colors.bg]}
        locations={[0, 0.55, 1]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={{ flex: 1 }}
      />
      {/* Overlay escuro por cima — garante contraste pro card, mantém o fundo discreto. */}
      <View className="absolute inset-0 bg-bg/60" />
    </View>
  );
}
