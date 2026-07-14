import { useTranslation } from "react-i18next";
import { ScreenContainer } from "@/components/layout/screen-container";
import { EmptyState } from "@/components/ui/empty-state";

/**
 * Placeholder do shell de tabs (Fase 0). A tela de perfil real (PlayerCard do
 * usuário, edição de posição/preferências...) chega na próxima task.
 */
export default function PerfilScreen() {
  const { t } = useTranslation("common");

  return (
    <ScreenContainer>
      <EmptyState
        title={t("emptyState.comingSoonTitle")}
        description={t("emptyState.comingSoonDescription")}
      />
    </ScreenContainer>
  );
}
