import SpotifyWebApi from "spotify-web-api-js";
import { redirectToLoginForAnonymousUsers } from "./auth-routing";

import type { ResponseToken } from "./spotify-api-auth-flow-utils";

export type User = {
  username: string;
  displayName: string;
  imageUrl: string;
};

export enum LC_KEYS {
  ACCESS_TOKEN = "access_token",
  REFRESH_TOKEN = "refresh_token",
  EXPIRES_AT = "expires_at",
  USER_DATA = "user_data",
  CODE_VERIFIER = "code_verifier",
}

export function logUserIn(token: ResponseToken): void {
  const accessToken = token.access_token;
  const refreshToken = token.refresh_token;

  const t = new Date();
  const expiresAt = t.setSeconds(t.getSeconds() + token.expires_in);

  localStorage.setItem(LC_KEYS.ACCESS_TOKEN, accessToken);
  localStorage.setItem(LC_KEYS.REFRESH_TOKEN, refreshToken);
  localStorage.setItem(LC_KEYS.EXPIRES_AT, `${expiresAt}`);
}

export function logout(): void {
  localStorage.removeItem(LC_KEYS.ACCESS_TOKEN);
  localStorage.removeItem(LC_KEYS.REFRESH_TOKEN);
  localStorage.removeItem(LC_KEYS.EXPIRES_AT);
  localStorage.removeItem(LC_KEYS.USER_DATA);
}

export function getSavedAccessToken(): string {
  return localStorage.getItem(LC_KEYS.ACCESS_TOKEN) || "";
}

export async function getSavedUser(): Promise<User> {
  const userData = localStorage.getItem(LC_KEYS.USER_DATA);
  if (userData) {
    const user = JSON.parse(userData);
    return Promise.resolve(user);
  }
  const accessToken = getSavedAccessToken();
  const spotifyApi = new SpotifyWebApi();
  spotifyApi.setAccessToken(accessToken);

  return spotifyApi.getMe().then((spotifyUser) => {
    const imageUrl =
      spotifyUser.images.length > 0 ? spotifyUser.images[0].url : "";
    const user: User = {
      username: spotifyUser.id,
      displayName: spotifyUser.display_name,
      imageUrl,
    };
    localStorage.setItem(LC_KEYS.USER_DATA, JSON.stringify(user));
    return user;
  });
}

export function handleUnauthorizeResponse() {
  logout();
  redirectToLoginForAnonymousUsers();
}
