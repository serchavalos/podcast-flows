<script lang="ts">
  import SpotifyWebApi from "spotify-web-api-js";
  import Button, { Label } from "@smui/button";
  import PageWithMenu from "../components/PageWithMenu.svelte";
  import PodcastFlowDetailsShowRow from "../components/PodcastFlowDetailsShowRow.svelte";
  import DeletePodcastDialog from "../components/DeletePodcastDialog.svelte";
  import { redirectToLoginForAnonymousUsers } from "../lib/auth-routing";
  import {
    getSavedAccessToken,
    handleUnauthorizeResponse,
  } from "../lib/auth-utils";
  import { PodcastFlowApi } from "../lib/podcast-flow-api";
  import { navigate } from "svelte-routing";

  redirectToLoginForAnonymousUsers();

  export let flowId: string;

  let flow: Record<string, any>;
  let shows: Array<SpotifyApi.ShowObjectFull> = [];
  let podcastFlowIdPendingDeletion: string | null;
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
    })
    .catch((err) => {
      if (err.status === 401) {
        return handleUnauthorizeResponse();
      }
    });

  function openDeletePodcastDialog(ev: Event): void {
    ev.stopPropagation();
    podcastFlowIdPendingDeletion = flowId;
  }
</script>

<PageWithMenu>
  {#if flow}
    <article>
      <div>
        <h1 class="mdc-typography--headline4">Title: {flow.name}</h1>
        <p>Interval: <strong>{flow.interval}</strong></p>
      </div>
      <div>
        <h2 class="mdc-typography--headline5">Subscribed to this shows:</h2>
        {#each shows as show}
          <PodcastFlowDetailsShowRow
            imageUrl={show.images[0].url}
            name={show.name}
            description={show.description}
          />
        {/each}
      </div>
      <div>
        <Button on:click={openDeletePodcastDialog} variant="raised">
          <Label>Delete</Label>
        </Button>
      </div>
      <DeletePodcastDialog
        bind:flowId={podcastFlowIdPendingDeletion}
        onPodcastFlowDeleted={() => {
          navigate("/");
        }}
      />
    </article>
  {/if}
</PageWithMenu>

<style>
  article {
    text-align: left;
  }
</style>
