// Mock manual do expo-secure-store para testes (Jest não roda em runtime nativo,
// então o Keychain/Keystore real não existe). Armazenamento em memória.
const store = new Map();

module.exports = {
  getItemAsync: jest.fn(async (key) => (store.has(key) ? store.get(key) : null)),
  setItemAsync: jest.fn(async (key, value) => {
    store.set(key, value);
  }),
  deleteItemAsync: jest.fn(async (key) => {
    store.delete(key);
  }),
};
