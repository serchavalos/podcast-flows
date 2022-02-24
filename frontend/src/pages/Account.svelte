<script lang="ts">
  import SpotifyWebApi from "spotify-web-api-js";

  const accessToken = localStorage.getItem("access_token");
  const savedUser = localStorage.getItem("user");
  let currentUser = savedUser ? JSON.parse(savedUser) : null;
  const spotifyApi = new SpotifyWebApi();

  spotifyApi.setAccessToken(accessToken);

  spotifyApi.getMe().then((user) => {
    currentUser = { username: user.id };
    localStorage.setItem("user", JSON.stringify(currentUser));
  });
</script>

<p>
  {#if currentUser}
    Welcome back, <strong>{currentUser.username}</strong>!
  {:else}
    Loading...
  {/if}
</p>
