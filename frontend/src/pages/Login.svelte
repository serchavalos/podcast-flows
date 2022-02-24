<script lang="ts">
  import { exchangeToken } from "../lib/auth-utils";
  import {
    SpotifyWebApiScope,
    generateRandom,
    generateCodeChallenge,
    generateUrlWithSearchParams,
  } from "../lib/auth-utils";

  const {
    env: { CLIENT_ID, REDIRECT_URI },
    // @ts-ignore TODO Add `appConfig` as a global variable
  } = appConfig;

  export function onLoginClick(ev: Event) {
    ev.preventDefault();
    const codeVerifier = generateRandom(64);

    generateCodeChallenge(codeVerifier).then((code_challenge) => {
      window.localStorage.setItem("code_verifier", codeVerifier);
      const loginURL = generateUrlWithSearchParams(
        "https://accounts.spotify.com/authorize",
        {
          response_type: "code",
          client_id: CLIENT_ID,
          scope: SpotifyWebApiScope,
          code_challenge_method: "S256",
          code_challenge,
          redirect_uri: REDIRECT_URI,
        }
      );
      window.location.assign(loginURL);
    });
  }

  const args = new URLSearchParams(window.location.search);
  const code = args.get("code");

  if (code) {
    exchangeToken(code).then((data) => {
      const accessToken = data.access_token;
      const refreshToken = data.refresh_token;

      const t = new Date();
      const expiresAt = t.setSeconds(t.getSeconds() + data.expires_in);

      localStorage.setItem("access_token", accessToken);
      localStorage.setItem("refresh_token", refreshToken);
      localStorage.setItem("expires_at", `${expiresAt}`);

      // clear search query params in the url
      window.location.assign("/");
    });
  }
</script>

<p>
  <a class="button" href={"#"} on:click={onLoginClick} target="_self">Login</a>
</p>
