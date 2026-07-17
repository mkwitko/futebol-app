import { useQueryClient } from "@tanstack/react-query";
import { getMeQueryKey } from "@/api/generated/hooks/authHooks/useGetMe";
import { useUpdateMyRoles } from "@/api/generated/hooks/authHooks/useUpdateMyRoles";

/**
 * Atualiza os tipos de conta (`PATCH /auth/me/roles`) e sincroniza o cache do
 * usuário logado: escreve a resposta em `getMe` (update otimista do valor
 * canônico) e invalida a query pra refetch de confirmação.
 */
export function useUpdateRoles() {
  const queryClient = useQueryClient();
  return useUpdateMyRoles({
    mutation: {
      onSuccess: (data) => {
        queryClient.setQueryData(getMeQueryKey(), data);
        void queryClient.invalidateQueries({ queryKey: getMeQueryKey() });
      },
    },
  });
}
