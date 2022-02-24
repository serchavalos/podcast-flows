<script lang="ts">
  import { navigate } from "svelte-routing";
  import SpotifyWebApi from "spotify-web-api-js";
  import PodcastFlowList from "../components/PodcastFlowList.svelte";

  const accessToken = localStorage.getItem("access_token");
  if (!accessToken) {
    navigate("/login");
  }

  const savedUser = localStorage.getItem("user");
  let currentUser = savedUser ? JSON.parse(savedUser) : null;
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
      <PodcastFlowList {accessToken} />
    </p>
  {:else}
    Loading...
  {/if}
</div>
