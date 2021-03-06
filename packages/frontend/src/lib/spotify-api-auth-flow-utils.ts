import { Buffer } from "buffer";
import { LC_KEYS } from "./auth-utils";

export type ResponseToken = {
  access_token: string;
  refresh_token: string;
  expires_in: number;
};

export const SpotifyWebApiScope =
  "playlist-read-collaborative playlist-modify-public playlist-modify-private playlist-read-private";

export function generateRandom(length = 5): string {
  const possibleChars = "abcdefghijklmnopqrstuvwxyz0123456789";
  const charsLength = possibleChars.length;
  let random = "";

  for (let i = 0; i < length; i++) {
    const randomPosition = Math.floor(Math.random() * charsLength);
    random += possibleChars.charAt(randomPosition);
  }

  return random;
}

/**
 *
 * @source https://github.com/tobika/spotify-auth-PKCE-example
 */
export async function generateCodeChallenge(
  codeVerifier: string
): Promise<string> {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(codeVerifier)
  );

  return Buffer.from(digest)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

export function generateUrlWithSearchParams(
  url: string,
  params: Record<string, string>
): URL {
  const urlObject = new URL(url);
  urlObject.search = new URLSearchParams(params).toString();

  return urlObject;
}

export async function exchangeToken(code: string): Promise<ResponseToken> {
  const {
    env: { CLIENT_ID, REDIRECT_URI },
  } = process;
  console.log(`DEBUG este si verdad? ${CLIENT_ID}`);
  const code_verifier = localStorage.getItem(LC_KEYS.CODE_VERIFIER);

  return fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
    },
    body: new URLSearchParams({
      client_id: CLIENT_ID,
      grant_type: "authorization_code",
      code,
      redirect_uri: REDIRECT_URI,
      code_verifier,
    }),
  })
    .then(addThrowErrorToFetch)
    .then((data) => {
      localStorage.removeItem(LC_KEYS.CODE_VERIFIER);
      return data;
    });
}

async function addThrowErrorToFetch(response: Response) {
  if (response.ok) {
    return response.json();
  } else {
    throw { response, error: await response.json() };
  }
}
