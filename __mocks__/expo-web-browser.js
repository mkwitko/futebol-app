// Mock manual do expo-web-browser para testes (Jest não abre browser nativo).
// Registra as chamadas pra os testes asseverarem a URL aberta.
module.exports = {
  openBrowserAsync: jest.fn(async () => ({ type: "opened" })),
  openAuthSessionAsync: jest.fn(async () => ({ type: "cancel" })),
  dismissBrowser: jest.fn(async () => {}),
  WebBrowserPresentationStyle: { AUTOMATIC: "automatic" },
};
