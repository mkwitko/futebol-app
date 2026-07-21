import { screen, userEvent, waitFor } from "@testing-library/react-native";
import { QueryClient } from "@tanstack/react-query";
import { Pressable, Text } from "react-native";
import { getMyPlayerQueryKey } from "@/api/generated/hooks/playersHooks";
import { useAuth } from "@/hooks/auth/use-auth";
import { renderWithProviders } from "../utils/render";

/** Harness mínimo que expõe as ações de auth como botões. */
function AuthHarness() {
  const { signIn, signOut } = useAuth();
  return (
    <>
      <Pressable testID="do-login" onPress={() => void signIn("novo@user.com", "correct-password")}>
        <Text>login</Text>
      </Pressable>
      <Pressable testID="do-logout" onPress={() => void signOut()}>
        <Text>logout</Text>
      </Pressable>
    </>
  );
}

function freshClient() {
  // gcTime alto (como em produção — default 5min): sem isso, uma entrada sem
  // observador é coletada na hora e o teste passaria à toa, sem provar o fix.
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: Infinity, staleTime: 30_000 },
      mutations: { retry: false },
    },
  });
}

describe("auth — reset de cache na troca de sessão (segurança)", () => {
  it("descarta o cache do usuário anterior ao logar (não vaza /players/me de outra conta)", async () => {
    const queryClient = freshClient();
    // Dado obsoleto do "usuário 1" numa query de chave ESTÁTICA (não escopada
    // por usuário) — é exatamente o que vazava entre contas.
    queryClient.setQueryData(getMyPlayerQueryKey(), { id: "user-1-player", name: "Usuário 1" });

    const user = userEvent.setup();
    renderWithProviders(<AuthHarness />, { queryClient });

    await user.press(screen.getByTestId("do-login"));

    // Após logar como usuário 2, o cache do usuário 1 não pode sobreviver.
    await waitFor(() =>
      expect(queryClient.getQueryData(getMyPlayerQueryKey())).toBeUndefined(),
    );
  });
});
