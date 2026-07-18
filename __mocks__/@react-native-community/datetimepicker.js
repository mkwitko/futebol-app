// Mock manual do @react-native-community/datetimepicker para testes.
//
// O componente nativo abre um picker de sistema (modal no Android, spinner no
// iOS) que não existe em Jest. A maioria dos testes deste app não precisa
// manipular o picker em si (cobrem validação/submit do form com os defaults
// do schema) — mas a tela de disponibilidade de quadra (Task A1 follow-up)
// precisa simular a escolha de uma data arbitrária no calendário nativo.
//
// Por isso o stub renderiza um `Pressable` tocável (em vez de `null`): ao
// pressioná-lo, dispara `onChange` com `value + 14 dias` — simula o usuário
// escolhendo uma data futura arbitrária no calendário nativo, o cenário que
// motivou trocar o stepper prev/next por um picker de verdade.
const React = require("react");
const { Pressable } = require("react-native");

function DateTimePicker({ value, onChange, testID }) {
  return React.createElement(Pressable, {
    testID: testID ?? "datetimepicker-mock",
    accessibilityRole: "button",
    onPress: () => {
      const next = new Date(value);
      next.setDate(next.getDate() + 14);
      onChange({ type: "set" }, next);
    },
  });
}

module.exports = {
  __esModule: true,
  default: DateTimePicker,
};
