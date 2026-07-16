import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Sheet } from "@/components/ui/sheet";
import { useAddMember } from "@/hooks/members/use-add-member";
import { useUpdateMember } from "@/hooks/members/use-update-member";
import { centsToReaisInput, reaisInputToCents } from "@/lib/money";
import { defaultMemberFormValues, type MemberFormValues } from "@/schemas/members/member-form.schema";
import type { ListMembers200 } from "@/api/generated/types/ListMembers";
import { MemberForm, type MemberFormMode } from "./member-form";

export type MemberSheetProps = {
  visible: boolean;
  groupId: string;
  /** Presente = modo edição (PATCH); ausente = modo criação (POST, jogador convidado). */
  member?: ListMembers200[number];
  /** Mensalidade padrão do grupo (centavos) — placeholder do override de mensalidade, modo `edit`. */
  groupMonthlyFeeCents?: number | null;
  onClose: () => void;
  onSaved: (mode: MemberFormMode) => void;
};

function memberToFormValues(member: ListMembers200[number]): MemberFormValues {
  const base = defaultMemberFormValues();
  return {
    ...base,
    name: member.player.name,
    phone: member.player.phone ?? "",
    // `primaryPos` é `null` pra membros ainda não avaliados pelo organizador
    // (Task 1 backend — adicionar membro não define posição nenhuma mais);
    // o form sempre precisa de um valor não-nulo pro `SegmentedControl`, daí
    // o fallback pro default (`base.primaryPos`, "atacante").
    primaryPos: member.primaryPos ?? base.primaryPos,
    secondaryPos: member.secondaryPos,
    affinity: { ...base.affinity, ...member.affinity },
    seedOverall: { ...base.seedOverall, ...member.seedOverall },
    billingMode: member.billingMode,
    monthlyFeeCentsOverrideInput: centsToReaisInput(member.monthlyFeeCentsOverride),
  };
}

export function MemberSheet({
  visible,
  groupId,
  member,
  groupMonthlyFeeCents,
  onClose,
  onSaved,
}: MemberSheetProps) {
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

    try {
      if (mode === "create") {
        // Form curto (Task 7, hub do grupo) — a API de criação só aceita
        // `{ name, phone?, billingMode? }`; posição/afinidade/overall não
        // fazem parte do body (o jogador se autodeclara depois).
        await addMember.mutateAsync({
          name: values.name,
          phone: values.phone?.trim() ? values.phone.trim() : undefined,
          billingMode: values.billingMode,
        });
      } else if (member) {
        const positions = Array.from(new Set([values.primaryPos, ...values.secondaryPos]));
        const affinity = Object.fromEntries(positions.map((position) => [position, values.affinity[position]]));
        const seedOverall = Object.fromEntries(
          positions.map((position) => [position, values.seedOverall[position]]),
        );
        await updateMember.mutateAsync(member.id, {
          primaryPos: values.primaryPos,
          secondaryPos: values.secondaryPos,
          affinity,
          seedOverall,
          billingMode: values.billingMode,
          monthlyFeeCentsOverride: reaisInputToCents(values.monthlyFeeCentsOverrideInput) ?? null,
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
        groupMonthlyFeeCents={groupMonthlyFeeCents}
      />
    </Sheet>
  );
}
