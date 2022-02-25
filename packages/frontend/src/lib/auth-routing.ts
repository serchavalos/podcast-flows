function isLoggedIn(): boolean {
  const accessToken = localStorage.getItem("access_token");
  return !!accessToken;
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
