// Mock manual do expo-clipboard para testes (Jest não roda em runtime nativo,
// então a área de transferência do sistema não existe). Armazenamento em memória.
let clipboard = "";

module.exports = {
  setStringAsync: jest.fn(async (value) => {
    clipboard = value;
    return true;
  }),
  getStringAsync: jest.fn(async () => clipboard),
};
