<script lang="ts">
  import Button from "@smui/button";
  import { redirectToHomeForLoggedInUsers } from "../lib/auth-routing";
  import { logUserIn } from "../lib/auth-utils";
  import { PodcastFlowApi } from "../lib/podcast-flow-api";
  import { exchangeToken } from "../lib/spotify-api-auth-flow-utils";
  import {
    SpotifyWebApiScope,
    generateRandom,
    generateCodeChallenge,
    generateUrlWithSearchParams,
  } from "../lib/spotify-api-auth-flow-utils";

  redirectToHomeForLoggedInUsers();

  const {
    env: { CLIENT_ID, REDIRECT_URI },
  } = process;
  const flowApi = new PodcastFlowApi();

  function onLoginClick(ev: Event) {
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
    exchangeToken(code)
      .then((data) => {
        logUserIn(data);
        return flowApi.registerUser(data.access_token, data.refresh_token);
      })
      .then(() => {
        // clear search query params in the url
        redirectToHomeForLoggedInUsers();
      });
  }
</script>

<div class="page">
  {#if !code}
    <div class="container">
      <h1>Podcast Flows</h1>
      <p>Start by registering using Spotify's credentials</p>
      <p>
        <Button
          on:click={onLoginClick}
          variant="raised"
          class="button-shaped-round">Login</Button
        >
      </p>
    </div>
  {/if}
</div>

<style>
  .page {
    height: 100vh;
    display: flex;
    flex-direction: column;
    text-align: center;
  }

  .container {
    margin: auto;
  }
</style>
