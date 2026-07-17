import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, View } from "react-native";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Text } from "@/components/ui/text";
import type { AttributeCategory } from "@/lib/player/attributes";
import { bestFieldPosition, fieldPositionAbbreviation } from "@/lib/player/position";
import { type SkillKey, skillLabel, toSkillList } from "@/lib/player/skills";
import { getTierFromOverall, tierColor } from "@/lib/player/tier";
import { cn } from "@/lib/utils";
import type { GetMyPlayer200 } from "@/api/generated/types/GetMyPlayer";

/** Abreviação FUT (3 letras) por categoria. */
const CATEGORY_ABBR: Record<AttributeCategory, string> = {
  ritmo: "RIT",
  finalizacao: "FIN",
  passe: "PAS",
  drible: "DRI",
  defesa: "DEF",
  fisico: "FÍS",
  goleiro: "GOL",
};

const FOOT_LABEL: Record<"left" | "right" | "both", string> = {
  left: "Canhoto",
  right: "Destro",
  both: "Ambidestro",
};

/** Linha de 5 estrelas (preenchidas até `value`). */
function Stars({ label, value }: { label: string; value: number | null }) {
  return (
    <View className="items-center gap-0.5">
      <Text className="font-body-medium text-[10px] uppercase tracking-wide text-white/70">
        {label}
      </Text>
      <Text className="font-display text-sm text-white">
        {"★".repeat(value ?? 0)}
        <Text className="text-white/25">{"★".repeat(5 - (value ?? 0))}</Text>
      </Text>
    </View>
  );
}

function StatPair({ abbr, value }: { abbr: string; value: number }) {
  return (
    <View className="flex-row items-baseline gap-1.5">
      <Text className="font-display text-lg text-white">{value}</Text>
      <Text className="font-body-medium text-[11px] uppercase tracking-wide text-white/70">
        {abbr}
      </Text>
    </View>
  );
}

export type FifaCardProps = {
  player: GetMyPlayer200;
  avatarUri?: string | null;
};

/**
 * Carta estilo FIFA Ultimate Team — overall geral + melhor posição, os 6
 * overalls de categoria no layout FUT (2 colunas), perna dominante, estrelas
 * (perna ruim/fintas), físico (altura/peso/idade), nacionalidade/time e as
 * habilidades (playstyles) como badges. Alimentada pelo `GET /players/me`
 * (overalls derivados dos atributos). O tier (cor da carta) vem do overall.
 */
export function FifaCard({ player, avatarUri }: FifaCardProps) {
  const cat = (player.categoryOverall ?? {}) as Partial<Record<AttributeCategory, number>>;
  const overall = player.generalOverall ?? 0;
  const tier = getTierFromOverall(overall);
  const best = bestFieldPosition((player.overallByPosition ?? {}) as Partial<Record<string, number>>);
  const skills = toSkillList(player.skills as string[] | undefined) as SkillKey[];

  const age = player.birthYear ? new Date().getFullYear() - player.birthYear : null;
  const physical = [
    player.heightCm ? `${player.heightCm} cm` : null,
    player.weightKg ? `${player.weightKg} kg` : null,
    age ? `${age} anos` : null,
  ].filter(Boolean);

  // Colunas FUT: esquerda RIT/FIN/PAS, direita DRI/DEF/FÍS.
  const left: AttributeCategory[] = ["ritmo", "finalizacao", "passe"];
  const right: AttributeCategory[] = ["drible", "defesa", "fisico"];

  return (
    <View
      className="w-72 self-center overflow-hidden rounded-3xl border"
      style={{ borderColor: tierColor(tier), backgroundColor: "#0E1A13" }}
    >
      <LinearGradient
        colors={[`${tierColor(tier)}55`, `${tierColor(tier)}11`, "transparent"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.8, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <View className="gap-3 p-5">
        {/* Topo: overall + posição | avatar */}
        <View className="flex-row items-start justify-between">
          <View className="items-center">
            <Text className="font-display-bold text-6xl leading-[58px] text-white">{overall}</Text>
            <Text className="font-display text-base uppercase tracking-wide text-white">
              {best ? fieldPositionAbbreviation(best.pos) : "—"}
            </Text>
            {player.dominantFoot ? (
              <Text className="mt-0.5 font-body-medium text-[11px] text-white/70">
                {FOOT_LABEL[player.dominantFoot]}
              </Text>
            ) : null}
          </View>
          <Avatar name={player.name} uri={avatarUri} size="lg" />
        </View>

        {/* Nome */}
        <Text
          className="text-center font-display text-lg uppercase tracking-wide text-white"
          numberOfLines={1}
        >
          {player.name}
        </Text>

        <View className="h-px bg-white/15" />

        {/* Overalls por categoria (layout FUT) */}
        <View className="flex-row justify-between px-2">
          <View className="gap-1.5">
            {left.map((c) => (
              <StatPair key={c} abbr={CATEGORY_ABBR[c]} value={cat[c] ?? 0} />
            ))}
          </View>
          <View className="w-px bg-white/15" />
          <View className="gap-1.5">
            {right.map((c) => (
              <StatPair key={c} abbr={CATEGORY_ABBR[c]} value={cat[c] ?? 0} />
            ))}
          </View>
        </View>

        {/* Estrelas: perna ruim + fintas */}
        {player.weakFoot != null || player.skillMoves != null ? (
          <>
            <View className="h-px bg-white/15" />
            <View className="flex-row justify-around">
              <Stars label="Perna ruim" value={player.weakFoot} />
              <Stars label="Fintas" value={player.skillMoves} />
            </View>
          </>
        ) : null}

        {/* Físico + nacionalidade/time */}
        {physical.length > 0 || player.nationality || player.preferredTeam ? (
          <>
            <View className="h-px bg-white/15" />
            <View className="gap-0.5">
              {physical.length > 0 ? (
                <Text className="text-center font-body-medium text-xs text-white/80">
                  {physical.join(" · ")}
                </Text>
              ) : null}
              {player.nationality || player.preferredTeam ? (
                <Text className="text-center font-body-medium text-xs text-white/80">
                  {[player.nationality, player.preferredTeam].filter(Boolean).join(" · ")}
                </Text>
              ) : null}
            </View>
          </>
        ) : null}

        {/* Playstyles */}
        {skills.length > 0 ? (
          <View className={cn("flex-row flex-wrap justify-center gap-1.5")}>
            {skills.map((s) => (
              <Badge key={s} variant="line">
                {skillLabel(s)}
              </Badge>
            ))}
          </View>
        ) : null}
      </View>
    </View>
  );
}
