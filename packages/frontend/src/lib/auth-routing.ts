import { getSavedAccessToken } from "./auth-utils";

function isLoggedIn(): boolean {
  return !!getSavedAccessToken();
}

export function redirectToLoginForAnonymousUsers(): void {
  if (!isLoggedIn()) {
    window.location.assign("/login");
  }
}

export function redirectToHomeForLoggedInUsers(): void {
  if (isLoggedIn()) {
    window.location.assign("/");
  }
}
