import { screen, userEvent, waitFor } from "@testing-library/react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import CreateMatchScreen from "@/app/group/[id]/create-match";
import { resetGroupsMocks } from "../mocks/handlers";
import { renderWithProviders } from "../utils/render";

const mockReplace = jest.fn();
const mockBack = jest.fn();

jest.mock("expo-router", () => {
  const actual = jest.requireActual("expo-router");
  return {
    ...actual,
    useLocalSearchParams: jest.fn(() => ({ id: "group-1" })),
    useRouter: jest.fn(() => ({ replace: mockReplace, back: mockBack, push: jest.fn() })),
  };
});

describe("Criar pelada", () => {
  beforeEach(() => {
    resetGroupsMocks();
    mockReplace.mockClear();
    mockBack.mockClear();
    (useLocalSearchParams as jest.Mock).mockReturnValue({ id: "group-1" });
    (useRouter as jest.Mock).mockReturnValue({ replace: mockReplace, back: mockBack, push: jest.fn() });
  });

  it("shows a validation error when submitting without a location", async () => {
    const user = userEvent.setup();
    renderWithProviders(<CreateMatchScreen />);

    expect(await screen.findByText("Novo futebol")).toBeOnTheScreen();

    await user.press(screen.getByTestId("create-match-submit"));

    expect(await screen.findByText("Campo obrigatório.")).toBeOnTheScreen();
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it("bloqueia o envio sem coords (local no mapa) e mostra o aviso", async () => {
    const user = userEvent.setup();
    renderWithProviders(<CreateMatchScreen />);

    await user.type(screen.getByLabelText("Local"), "Quadra do Zico");
    // Sem escolher local no mapa → coords nulas → não cria.
    await user.press(screen.getByTestId("create-match-submit"));

    expect(await screen.findByTestId("create-match-geo-error")).toBeOnTheScreen();
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it("submits with the default slots/date and navigates to the new match detail", async () => {
    const user = userEvent.setup();
    renderWithProviders(<CreateMatchScreen />);

    await user.type(screen.getByLabelText("Local"), "Quadra do Zico");
    // Escolhe o local via "usar minha localização" (expo-location mockado),
    // que preenche lat/lng — agora obrigatórios pra pelada ser descobrível.
    await user.press(screen.getByTestId("location-use-mine"));
    await waitFor(() => expect(screen.queryByTestId("create-match-geo-error")).toBeNull());

    await user.press(screen.getByTestId("create-match-submit"));

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledTimes(1);
    });

    const call = mockReplace.mock.calls[0]![0];
    expect(call.pathname).toBe("/match/[id]");
    expect(call.params.created).toBe("1");
    expect(typeof call.params.id).toBe("string");
  });
});
