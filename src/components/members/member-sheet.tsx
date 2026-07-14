import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Sheet } from "@/components/ui/sheet";
import { useAddMember } from "@/hooks/members/use-add-member";
import { useUpdateMember } from "@/hooks/members/use-update-member";
import { defaultMemberFormValues, type MemberFormValues } from "@/schemas/members/member-form.schema";
import type { ListMembers200 } from "@/api/generated/types/ListMembers";
import { MemberForm, type MemberFormMode } from "./member-form";

export type MemberSheetProps = {
  visible: boolean;
  groupId: string;
  /** Presente = modo edição (PATCH); ausente = modo criação (POST, jogador convidado). */
  member?: ListMembers200[number];
  onClose: () => void;
  onSaved: (mode: MemberFormMode) => void;
};

function memberToFormValues(member: ListMembers200[number]): MemberFormValues {
  const base = defaultMemberFormValues();
  return {
    ...base,
    name: member.player.name,
    phone: member.player.phone ?? "",
    primaryPos: member.primaryPos,
    secondaryPos: member.secondaryPos,
    affinity: { ...base.affinity, ...member.affinity },
    seedOverall: { ...base.seedOverall, ...member.seedOverall },
  };
}

export function MemberSheet({ visible, groupId, member, onClose, onSaved }: MemberSheetProps) {
  const { t } = useTranslation("groups");
  const [formError, setFormError] = useState<string | null>(null);
  const addMember = useAddMember(groupId);
  const updateMember = useUpdateMember(groupId);

  const mode: MemberFormMode = member ? "edit" : "create";
  const defaultValues = useMemo(
    () => (member ? memberToFormValues(member) : defaultMemberFormValues()),
    [member],
  );

  const onSubmit = async (values: MemberFormValues) => {
    setFormError(null);
    const positions = Array.from(new Set([values.primaryPos, ...values.secondaryPos]));
    const affinity = Object.fromEntries(positions.map((position) => [position, values.affinity[position]]));
    const seedOverall = Object.fromEntries(
      positions.map((position) => [position, values.seedOverall[position]]),
    );

    try {
      if (mode === "create") {
        await addMember.mutateAsync({
          name: values.name,
          phone: values.phone?.trim() ? values.phone.trim() : undefined,
          primaryPos: values.primaryPos,
          secondaryPos: values.secondaryPos,
          affinity,
          seedOverall,
        });
      } else if (member) {
        await updateMember.mutateAsync(member.id, {
          primaryPos: values.primaryPos,
          secondaryPos: values.secondaryPos,
          affinity,
          seedOverall,
        });
      }
      onSaved(mode);
    } catch {
      setFormError(t(mode === "create" ? "member.addError" : "member.editError"));
    }
  };

  return (
    <Sheet
      visible={visible}
      onClose={onClose}
      title={t(mode === "create" ? "member.addTitle" : "member.editTitle")}
    >
      {/* `key` força remount do form ao trocar de membro/modo, garantindo que
          os `defaultValues` do RHF sejam relidos (RHF não reage a mudanças de
          `defaultValues` em um form já montado). */}
      <MemberForm
        key={member?.id ?? "create"}
        mode={mode}
        defaultValues={defaultValues}
        onSubmit={onSubmit}
        submitting={addMember.isPending || updateMember.isPending}
        formError={formError}
      />
    </Sheet>
  );
}
