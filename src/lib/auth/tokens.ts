import * as SecureStore from "expo-secure-store";

const ACCESS = "auth.accessToken";
const REFRESH = "auth.refreshToken";

export type Tokens = { accessToken: string; refreshToken: string };

export async function saveTokens({ accessToken, refreshToken }: Tokens): Promise<void> {
  await SecureStore.setItemAsync(ACCESS, accessToken);
  await SecureStore.setItemAsync(REFRESH, refreshToken);
}

export async function getAccessToken(): Promise<string | null> {
  return SecureStore.getItemAsync(ACCESS);
}

export async function getRefreshToken(): Promise<string | null> {
  return SecureStore.getItemAsync(REFRESH);
}

export async function clearTokens(): Promise<void> {
  await SecureStore.deleteItemAsync(ACCESS);
  await SecureStore.deleteItemAsync(REFRESH);
}
