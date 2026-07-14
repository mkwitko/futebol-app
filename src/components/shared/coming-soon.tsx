import { useTranslation } from "react-i18next";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/layout/screen-container";
import { EmptyState } from "@/components/ui/empty-state";
import { ScreenHeader } from "@/components/ui/screen-header";

/**
 * Placeholder para rotas cujo destino ainda não foi construído (detalhe de
 * pelada/partida, criação de pelada) — a próxima task substitui isto por uma
 * tela real. Existe só para a navegação não quebrar.
 */
export function ComingSoonScreen() {
  const { t } = useTranslation("common");
  const router = useRouter();

  return (
    <ScreenContainer>
      <ScreenHeader title={t("emptyState.comingSoonTitle")} onBack={() => router.back()} />
      <EmptyState
        title={t("emptyState.comingSoonTitle")}
        description={t("emptyState.comingSoonDescription")}
      />
    </ScreenContainer>
  );
}
