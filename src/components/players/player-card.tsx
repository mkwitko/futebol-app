import { LinearGradient } from "expo-linear-gradient";
import { useEffect } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";
import { Avatar } from "@/components/ui/avatar";
import { Badge, type BadgeVariant } from "@/components/ui/badge";
import { Divider } from "@/components/ui/divider";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";
import { positionAbbreviation, type Position } from "@/lib/player/position";
import { getTierFromOverall, tierColor, tierLabel, tierProgress, type Tier } from "@/lib/player/tier";

export type PlayerCardVariant = "full" | "compact";

export type PlayerCardStats = {
  matches?: number;
  wins?: number;
  goals?: number;
};

export type PlayerCardProps = {
  name: string;
  position: Position;
  /** 0-99 — o número em destaque do card. */
  overall: number;
  /**
   * Tier explícito (ex.: `career.level`, autoritativo do backend). Quando
   * omitido, o tier é derivado do `overall` via `getTierFromOverall` — as
   * duas fontes hoje concordam (os limiares em `career-config.ts` do backend
   * espelham `TIER_MIN_PRATA`/`TIER_MIN_OURO` aqui), mas passar o `level` da
   * carreira explicitamente evita que as duas escalas precisem ficar em sync
   * manualmente no futuro.
   */
  tier?: Tier;
  avatarUri?: string | null;
  /**
   * Estatísticas agregadas (jogos/vitórias/gols). Omitir por completo quando
   * ainda não existirem dados (ex.: membro recém-cadastrado na Fase 0, ou
   * carreira ainda zerada na Fase 1) — o card então mostra só posição +
   * overall, sem uma linha "zerada".
   */
  stats?: PlayerCardStats;
  variant?: PlayerCardVariant;
  onPress?: () => void;
  /** Ação secundária (ex.: editar membro) — mantém `onPress` livre para navegação. */
  onLongPress?: () => void;
  className?: string;
  testID?: string;
};

const TIER_BORDER_CLASSES: Record<Tier, string> = {
  bronze: "border-tier-bronze",
  prata: "border-tier-prata",
  ouro: "border-tier-ouro",
};

const TIER_FILL_CLASSES: Record<Tier, string> = {
  bronze: "bg-tier-bronze",
  prata: "bg-tier-prata",
  ouro: "bg-tier-ouro",
};

const TIER_BADGE_VARIANT: Record<Tier, BadgeVariant> = {
  bronze: "bronze",
  prata: "prata",
  ouro: "ouro",
};

function StatCell({ value, label }: { value: number; label: string }) {
  return (
    <View className="flex-1 items-center gap-0.5">
      <Text className="font-display text-lg text-ink">{value}</Text>
      <Text className="font-body-medium text-[10px] uppercase tracking-wide text-muted">
        {label}
      </Text>
    </View>
  );
}

/**
 * PlayerCard — elemento assinatura do app. Inspirado em cards de rating
 * esportivo (FUT-like), mas contido: o tratamento "premium" (gradiente,
 * brilho) fica só na variante `full`; a `compact` (linha de lista/elenco)
 * permanece discreta por design e por performance em listas longas.
 */
export function PlayerCard({
  name,
  position,
  overall,
  tier: tierProp,
  avatarUri,
  stats,
  variant = "full",
  onPress,
  onLongPress,
  className,
  testID,
}: PlayerCardProps) {
  const tier = tierProp ?? getTierFromOverall(overall);
  const abbreviation = positionAbbreviation(position);
  const reducedMotion = useReducedMotion();

  const scale = useSharedValue(1);
  const shine = useSharedValue(0);

  useEffect(() => {
    if (variant !== "full" || reducedMotion) return;
    shine.value = withDelay(200, withTiming(1, { duration: 900 }));
  }, [variant, reducedMotion, shine]);

  const pressStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const shineStyle = useAnimatedStyle(() => ({
    opacity: reducedMotion ? 0 : 0.5 * (1 - shine.value),
    transform: [{ translateX: -220 + shine.value * 440 }, { rotate: "20deg" }],
  }));

  const handlePressIn = () => {
    if (reducedMotion) return;
    // eslint-disable-next-line react-hooks/immutability -- mutar `.value` de um shared value é a API do Reanimated, não um estado React.
    scale.value = withTiming(variant === "full" ? 0.97 : 0.985, { duration: 100 });
  };
  const handlePressOut = () => {
    if (reducedMotion) return;
    // eslint-disable-next-line react-hooks/immutability -- mutar `.value` de um shared value é a API do Reanimated, não um estado React.
    scale.value = withTiming(1, { duration: 140 });
  };

  const body =
    variant === "full" ? (
      <View
        className={cn(
          "w-64 self-center overflow-hidden rounded-3xl border bg-surface",
          TIER_BORDER_CLASSES[tier],
        )}
      >
        <LinearGradient
          colors={[`${tierColor(tier)}33`, "transparent"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <Animated.View
          pointerEvents="none"
          style={[
            { position: "absolute", top: -40, bottom: -40, left: -20, width: 60 },
            shineStyle,
          ]}
          className="bg-white/40"
        />

        <View className="gap-3 p-5">
          <Badge variant={TIER_BADGE_VARIANT[tier]}>{tierLabel(tier)}</Badge>

          <View className="flex-row items-center justify-between">
            <View className="gap-1.5">
              <Text className="font-display-bold text-6xl leading-[56px] text-ink">
                {overall}
              </Text>
              <Badge variant="line">{abbreviation}</Badge>
            </View>
            <Avatar name={name} uri={avatarUri} size="lg" />
          </View>

          <Text
            variant="display"
            className="text-center text-lg uppercase tracking-wide"
            numberOfLines={1}
          >
            {name}
          </Text>

          <Divider />

          <View className="gap-1.5">
            <View className="flex-row items-center justify-between">
              <Text className="font-body-medium text-[10px] uppercase tracking-wide text-muted">
                Nível
              </Text>
              <Text className="font-body-medium text-[10px] text-muted">
                {tierProgress(overall)}%
              </Text>
            </View>
            <View className="h-1.5 overflow-hidden rounded-full bg-line">
              <View
                className={cn("h-full rounded-full", TIER_FILL_CLASSES[tier])}
                style={{ width: `${tierProgress(overall)}%` }}
              />
            </View>
          </View>

          {stats ? (
            <>
              <Divider />
              <View className="flex-row items-center">
                <StatCell value={stats.matches ?? 0} label="Jogos" />
                <View className="h-8 w-px bg-line" />
                <StatCell value={stats.wins ?? 0} label="Vitórias" />
                <View className="h-8 w-px bg-line" />
                <StatCell value={stats.goals ?? 0} label="Gols" />
              </View>
            </>
          ) : null}
        </View>
      </View>
    ) : (
      <View
        className={cn(
          "flex-row items-center gap-3 rounded-2xl border border-line border-l-4 bg-surface py-2.5 pl-3 pr-4",
          TIER_BORDER_CLASSES[tier],
        )}
      >
        <Avatar name={name} uri={avatarUri} size="md" />
        <View className="flex-1 gap-1">
          <Text className="font-body-semibold text-base text-ink" numberOfLines={1}>
            {name}
          </Text>
          <Badge variant="line" className="self-start">
            {abbreviation}
          </Badge>
        </View>
        <Text className="font-display text-3xl text-ink">{overall}</Text>
      </View>
    );

  const accessibilityLabel = `${name}, ${abbreviation}, overall ${overall}, tier ${tierLabel(tier)}`;

  if (!onPress && !onLongPress) {
    return (
      <View
        testID={testID}
        accessibilityLabel={accessibilityLabel}
        className={className}
      >
        {body}
      </View>
    );
  }

  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      onLongPress={onLongPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      className={cn("active:opacity-95", className)}
    >
      <Animated.View style={pressStyle}>{body}</Animated.View>
    </Pressable>
  );
}
