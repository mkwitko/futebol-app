import { render, screen } from "@testing-library/react-native";
import { Text } from "react-native";
import { ScreenContainer } from "@/components/layout/screen-container";

// useSafeAreaInsets / SafeAreaView need no provider here (SafeAreaView has a
// fallback), but if this test throws for safe-area, add the same local mock used
// in test/components/drawer-content.test.tsx.
describe("ScreenContainer", () => {
  it("renders a pinned footer node", () => {
    render(
      <ScreenContainer footer={<Text>PINNED_FOOTER</Text>}>
        <Text>BODY</Text>
      </ScreenContainer>,
    );
    expect(screen.getByText("BODY")).toBeOnTheScreen();
    expect(screen.getByText("PINNED_FOOTER")).toBeOnTheScreen();
  });
});
