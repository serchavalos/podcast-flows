<script lang="ts">
  import SpotifyWebApi from "spotify-web-api-js";

  import PodcastFlowList from "../components/PodcastFlowList.svelte";
  import { redirectToLoginForAnonymousUsers } from "../lib/auth-routing";

  redirectToLoginForAnonymousUsers();

  const savedUser = localStorage.getItem("user");
  let currentUser = savedUser ? JSON.parse(savedUser) : null;
  const accessToken = localStorage.getItem("access_token");
  const spotifyApi = new SpotifyWebApi();

  spotifyApi.setAccessToken(accessToken);

  spotifyApi.getMe().then((user) => {
    currentUser = { username: user.id };
    localStorage.setItem("user", JSON.stringify(currentUser));
  });
</script>

<div>
  {#if currentUser}
    <p>
      Welcome back, <strong>{currentUser.username}</strong>!
    </p>
    <p>
      <PodcastFlowList />
    </p>
  {:else}
    Loading...
  {/if}
</div>
