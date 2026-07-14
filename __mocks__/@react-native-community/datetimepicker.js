// Mock manual do @react-native-community/datetimepicker para testes.
//
// O componente nativo abre um picker de sistema (modal no Android, spinner no
// iOS) que não existe em Jest. Os testes deste app não precisam manipular o
// picker em si (cobrem validação/submit do form com os defaults do schema) —
// então um stub que não renderiza nada é suficiente e evita puxar código
// nativo no ambiente de teste.
function DateTimePicker() {
  return null;
}

module.exports = {
  __esModule: true,
  default: DateTimePicker,
};
