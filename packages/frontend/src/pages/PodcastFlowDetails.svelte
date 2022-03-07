<script lang="ts">
  import SpotifyWebApi from "spotify-web-api-js";

  import PageWithMenu from "../components/PageWithMenu.svelte";
  import { redirectToLoginForAnonymousUsers } from "../lib/auth-routing";
  import { getSavedAccessToken } from "../lib/auth-utils";
  import { PodcastFlowApi } from "../lib/podcast-flow-api";

  redirectToLoginForAnonymousUsers();

  export let flowId: string;

  let flow: Record<string, any>;
  let shows: Array<SpotifyApi.ShowObjectFull> = [];
  const accessToken = getSavedAccessToken();

  const spotifyApi = new SpotifyWebApi();
  const flowApi = new PodcastFlowApi();
  spotifyApi.setAccessToken(accessToken);
  flowApi.setAccessToken(accessToken);

  flowApi
    .getFlowById(flowId)
    .then(async (data) => {
      flow = data;
      return spotifyApi.getShows(flow.showIds);
    })
    .then((response) => {
      shows = response.shows;
    });
</script>

<PageWithMenu>
  {#if flow}
    <article>
      <div>
        <h3>{flow.name}</h3>
        <p>Interval: <strong>{flow.interval}</strong></p>
      </div>
      <div>
        {#each shows as show}
          <div class="flow-row">
            <img
              src={show.images[0].url}
              alt={show.name}
              width="65"
              height="65"
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
</PageWithMenu>

<style>
  article {
    text-align: left;
  }

  .flow-row {
    display: flex;
    justify-content: center;
  }
  .flow-row > img {
    display: block;
  }
  .flow-row > div {
    padding: 0 1em;
  }
</style>
