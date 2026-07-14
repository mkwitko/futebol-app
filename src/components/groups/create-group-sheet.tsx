import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Sheet } from "@/components/ui/sheet";
import { useCreateGroup } from "@/hooks/groups/use-create-group";
import type { CreateGroupFormValues } from "@/schemas/groups/create-group.schema";
import { CreateGroupForm } from "./create-group-form";

export type CreateGroupSheetProps = {
  visible: boolean;
  onClose: () => void;
  /** Disparado após a criação ter sucesso (a tela decide fechar/mostrar toast). */
  onCreated: () => void;
};

export function CreateGroupSheet({ visible, onClose, onCreated }: CreateGroupSheetProps) {
  const { t } = useTranslation("groups");
  const [formError, setFormError] = useState<string | null>(null);
  const createGroup = useCreateGroup();

  const onSubmit = async (values: CreateGroupFormValues) => {
    setFormError(null);
    try {
      await createGroup.mutateAsync({ data: { name: values.name, statsMode: "organizador" } });
      onCreated();
    } catch {
      setFormError(t("create.error"));
    }
  };

  return (
    <Sheet visible={visible} onClose={onClose} title={t("create.title")}>
      <CreateGroupForm onSubmit={onSubmit} submitting={createGroup.isPending} formError={formError} />
    </Sheet>
  );
}
