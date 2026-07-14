import { useCreateInvite as useCreateInviteMutation } from "@/api/generated/hooks/invitesHooks";

/** Cria um convite (link do zap) para a pelada. Não altera nenhum cache existente. */
export function useCreateInvite(matchId: string) {
  const mutation = useCreateInviteMutation();

  return {
    mutateAsync: () => mutation.mutateAsync({ id: matchId }),
    isPending: mutation.isPending,
  };
}
