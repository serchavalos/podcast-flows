import { navigate } from "svelte-routing";
import { getSavedAccessToken } from "./auth-utils";

function isLoggedIn(): boolean {
  return !!getSavedAccessToken();
}

export function redirectToLoginForAnonymousUsers(): void {
  if (!isLoggedIn()) {
    navigate("/login");
  }
}

export function redirectToHomeForLoggedInUsers(): void {
  if (isLoggedIn()) {
    navigate("/");
  }
}
