import { useTranslation } from "react-i18next";
import { useLocalSearchParams, useRouter } from "expo-router";
import { MensalidadesContent } from "@/components/groups/mensalidades-content";
import { ScreenContainer } from "@/components/layout/screen-container";
import { ScreenHeader } from "@/components/ui/screen-header";

/**
 * Rota standalone de "Mensalidades" — hoje também embutida como aba do hub
 * do grupo (`app/group/[id].tsx`, Task 7) via `MensalidadesContent`. Mantida
 * como rota própria para deep-link direto; o conteúdo em si vive no
 * componente compartilhado.
 */
export default function MensalidadesScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { t } = useTranslation("groups");

  return (
    <ScreenContainer className="gap-6">
      <ScreenHeader title={t("mensalidades.title")} onBack={() => router.back()} />
      <MensalidadesContent groupId={id} />
    </ScreenContainer>
  );
}
