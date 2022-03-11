<script lang="ts">
  import { navigate } from "svelte-routing";
  import type { PodcastFlow } from "@podcast-flows/api";
  import List, {
    Item,
    Graphic,
    Text,
    PrimaryText,
    SecondaryText,
    Meta,
  } from "@smui/list";
  import IconButton from "@smui/icon-button";
  import { redirectToLoginForAnonymousUsers } from "../lib/auth-routing";
  import {
    getSavedAccessToken,
    handleUnauthorizeResponse,
  } from "../lib/auth-utils";
  import { PodcastFlowApi } from "../lib/podcast-flow-api";
  import DeletePodcastDialog from "./DeletePodcastDialog.svelte";

  redirectToLoginForAnonymousUsers();

  let podcastFlows: Array<PodcastFlow> | null = null;
  let podcastFlowIdPendingDeletion: string | null;

  const accessToken = getSavedAccessToken();
  const flowApi = new PodcastFlowApi();
  flowApi.setAccessToken(accessToken);

  if (!podcastFlows) {
    flowApi
      .getAllFlows()
      .then((data) => {
        podcastFlows = data;
      })
      .catch((err) => {
        console.log(err);
        if (err.status === 401) {
          return handleUnauthorizeResponse();
        }
      });
  }

  function openDeletePodcastDialog(ev: Event, flowId: string): void {
    ev.stopPropagation();
    podcastFlowIdPendingDeletion = flowId;
  }
</script>

{#if podcastFlows}
  <List twoLine>
    {#each podcastFlows as flow}
      <Item on:SMUI:action={() => navigate(`/flow/${flow.id}`)}>
        <Graphic class="material-icons">radio</Graphic>
        <Text>
          <PrimaryText>{flow.name}</PrimaryText>
          <SecondaryText>Interval: {flow.interval}</SecondaryText>
        </Text>
        <Meta>
          <IconButton
            class="material-icons"
            on:click={(ev) => openDeletePodcastDialog(ev, flow.id)}
            >delete</IconButton
          >
        </Meta>
      </Item>
    {/each}
  </List>

  <DeletePodcastDialog
    bind:flowId={podcastFlowIdPendingDeletion}
    onPodcastFlowDeleted={(flowId) => {
      podcastFlows = podcastFlows.filter((f) => f.id !== flowId);
    }}
  />
{/if}
