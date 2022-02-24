<script lang="ts">
  export let flowId: string;

  import SpotifyWebApi from "spotify-web-api-js";

  let flow: Record<string, any>;
  let shows: Array<SpotifyApi.ShowObjectFull> = [];
  const accessToken = localStorage.getItem("access_token");
  const spotifyApi = new SpotifyWebApi();
  spotifyApi.setAccessToken(accessToken);

  fetch(`http://localhost:8888/api/podcast-flows/${flowId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })
    .then((response) => response.json())
    .then(async (data) => {
      flow = data;

      const response = await spotifyApi.getShows(flow.showIds);
      shows = response.shows;
    });
</script>

{#if flow}
  <article>
    <div>
      <h3>{flow.name}</h3>
      <p>Interval: <strong>{flow.interval}</strong></p>
    </div>
    <div>
      {#each shows as show}
        <div class="row">
          <img
            src={show.images[0].url}
            alt={show.name}
            width="150"
            height="150"
          />
          <div>
            <strong>{show.name}</strong>
            <p>{@html show.description}</p>
          </div>
        </div>
      {/each}
    </div>
  </article>
{/if}

<style>
  article {
    text-align: left;
  }

  .row {
    display: flex;
    justify-content: center;
  }
  .row > img {
    display: block;
  }
  .row > div {
    padding: 0 1em;
  }
</style>
