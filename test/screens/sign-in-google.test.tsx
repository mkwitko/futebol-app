import { screen, userEvent, waitFor } from "@testing-library/react-native";
import SignInScreen from "@/app/(auth)/sign-in";
import { getMeQueryKey } from "@/api/generated/hooks/authHooks/useGetMe";
import { renderWithProviders } from "../utils/render";

// Simula os client IDs OAuth configurados (ver `.env.example`) — com eles,
// `isGoogleSignInConfigured` (src/lib/auth/google.ts) vira `true` e o botão
// roda o fluxo nativo de verdade em vez de ficar em "em breve". O módulo
// nativo em si é sempre mockado (`__mocks__/@react-native-google-signin`) —
// nunca roda de fato em Jest/Expo Go.
jest.mock("@/env", () => {
  const actual = jest.requireActual("@/env");
  return {
    ...actual,
    env: { ...actual.env, EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID: "test-web-client-id.apps.googleusercontent.com" },
  };
});

describe("SignInScreen — Google configurado", () => {
  it("runs the native flow and logs in via loginGoogleUser when Google is configured", async () => {
    const user = userEvent.setup();
    const { queryClient } = renderWithProviders(<SignInScreen />);

    const button = await screen.findByTestId("google-sign-in-cta");
    expect(button.props.accessibilityState?.disabled).not.toBe(true);

    await user.press(button);

    await waitFor(() => {
      expect(queryClient.getQueryData(getMeQueryKey())).toMatchObject({ email: "alice@futebol.app" });
    });
    // Sem erro → o diálogo de aviso (ConfirmDialog) não aparece.
    expect(
      screen.queryByText("Não foi possível entrar com o Google. Tente novamente."),
    ).not.toBeOnTheScreen();
  });
});
