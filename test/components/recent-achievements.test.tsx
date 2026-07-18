import { fireEvent, render, screen } from "@testing-library/react-native";
import { useRouter } from "expo-router";
import { RecentAchievements } from "@/components/home/recent-achievements";
import type { Achievement } from "@/components/players/achievements-grid";

const mockNavigate = jest.fn();
jest.mock("expo-router", () => {
  const actual = jest.requireActual("expo-router");
  return { ...actual, useRouter: jest.fn(() => ({ navigate: mockNavigate, push: jest.fn(), back: jest.fn() })) };
});

// i18n is initialized globally in test/setup.ts.
const unlocked: Achievement[] = [
  { key: "first_match", label: "Estreia", description: "d", icon: "⚽", unlocked: true },
];

describe("RecentAchievements", () => {
  beforeEach(() => mockNavigate.mockClear());

  it("returns null when there are no unlocked achievements", () => {
    const { toJSON } = render(<RecentAchievements achievements={[]} />);
    expect(toJSON()).toBeNull();
  });

  it("renders the title and navigates to perfil on 'Ver todas'", () => {
    render(<RecentAchievements achievements={unlocked} />);
    expect(screen.getByText("Conquistas")).toBeOnTheScreen();
    fireEvent.press(screen.getByText("Ver todas"));
    expect(mockNavigate).toHaveBeenCalledWith("/perfil");
  });
});
