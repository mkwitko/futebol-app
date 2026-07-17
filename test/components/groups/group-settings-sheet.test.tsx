import { fireEvent, screen, waitFor } from "@testing-library/react-native";
import { GroupSettingsSheet } from "@/components/groups/group-settings-sheet";
import { resetBillingMocks, setBillingMock } from "../../mocks/handlers";
import { renderWithProviders } from "../../utils/render";

jest.mock("expo-router", () => {
  const actual = jest.requireActual("expo-router");
  return { ...actual, useRouter: jest.fn(() => ({ push: jest.fn(), back: jest.fn() })) };
});

const baseProps = {
  visible: true,
  onClose: jest.fn(),
  groupName: "Pelada dos Amigos",
  monthlyFeeCents: null,
  onSaveFee: jest.fn(async () => {}),
};

describe("GroupSettingsSheet — descoberta pública", () => {
  beforeEach(() => resetBillingMocks());

  it("mostra o toggle público pro dono com a feature public_groups", async () => {
    setBillingMock({ features: ["public_groups"], paymentsEnabled: true });
    renderWithProviders(
      <GroupSettingsSheet {...baseProps} isOwner isPublic={false} joinPolicy="open" onSavePublic={jest.fn()} />,
    );

    expect(await screen.findByTestId("group-public-toggle")).toBeOnTheScreen();
  });

  it("mostra a política de entrada quando o grupo já é público", async () => {
    setBillingMock({ features: ["public_groups"], paymentsEnabled: true });
    renderWithProviders(
      <GroupSettingsSheet {...baseProps} isOwner isPublic joinPolicy="request" onSavePublic={jest.fn()} />,
    );

    expect(await screen.findByText("Aprovar pedidos")).toBeOnTheScreen();
    expect(screen.getByText("Entrar direto")).toBeOnTheScreen();
  });

  it("salva ao ligar o toggle", async () => {
    setBillingMock({ features: ["public_groups"], paymentsEnabled: true });
    const onSavePublic = jest.fn(async () => {});
    renderWithProviders(
      <GroupSettingsSheet {...baseProps} isOwner isPublic={false} joinPolicy="open" onSavePublic={onSavePublic} />,
    );

    fireEvent(await screen.findByTestId("group-public-toggle"), "valueChange", true);
    expect(onSavePublic).toHaveBeenCalledWith({ isPublic: true });
  });

  it("mostra o upgrade CTA (sem a feature) em vez do toggle", async () => {
    setBillingMock({ features: [], paymentsEnabled: true });
    renderWithProviders(
      <GroupSettingsSheet {...baseProps} isOwner isPublic={false} joinPolicy="open" onSavePublic={jest.fn()} />,
    );

    expect(await screen.findByTestId("upgrade-cta")).toBeOnTheScreen();
    expect(screen.queryByTestId("group-public-toggle")).not.toBeOnTheScreen();
  });

  it("esconde a seção pública pra quem não é dono", async () => {
    setBillingMock({ features: ["public_groups"], paymentsEnabled: true });
    renderWithProviders(
      <GroupSettingsSheet {...baseProps} isOwner={false} isPublic={false} joinPolicy="open" onSavePublic={jest.fn()} />,
    );

    await waitFor(() => {
      expect(screen.queryByTestId("group-public-settings")).not.toBeOnTheScreen();
    });
    expect(screen.queryByTestId("upgrade-cta")).not.toBeOnTheScreen();
  });
});
