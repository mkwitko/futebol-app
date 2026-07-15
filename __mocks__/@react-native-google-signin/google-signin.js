// Mock manual do @react-native-google-signin/google-signin para testes.
//
// É um módulo nativo (código Swift/Kotlin) — não existe fora de um build
// nativo real, então não roda em Jest nem no Expo Go. Os testes deste app
// cobrem o caminho de código + o config-gating (ver `src/lib/auth/google.ts`
// e `google-sign-in-button.test.tsx`), nunca o fluxo nativo em si.
const GoogleSignin = {
  configure: jest.fn(),
  hasPlayServices: jest.fn().mockResolvedValue(true),
  signIn: jest.fn().mockResolvedValue({
    type: "success",
    data: {
      idToken: "fake-google-id-token",
      scopes: [],
      serverAuthCode: null,
      user: {
        id: "google-user-1",
        email: "alice@futebol.app",
        name: "Alice",
        givenName: "Alice",
        familyName: null,
        photo: null,
      },
    },
  }),
  signOut: jest.fn().mockResolvedValue(undefined),
};

const statusCodes = {
  SIGN_IN_CANCELLED: "SIGN_IN_CANCELLED",
  IN_PROGRESS: "IN_PROGRESS",
  PLAY_SERVICES_NOT_AVAILABLE: "PLAY_SERVICES_NOT_AVAILABLE",
};

function isErrorWithCode(error) {
  return typeof error === "object" && error !== null && "code" in error;
}

function isSuccessResponse(response) {
  return response?.type === "success";
}

module.exports = {
  __esModule: true,
  GoogleSignin,
  statusCodes,
  isErrorWithCode,
  isSuccessResponse,
};
