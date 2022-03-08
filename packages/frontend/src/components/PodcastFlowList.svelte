<script lang="ts">
  import { navigate } from "svelte-routing";
  import type { PodcastFlow } from "@podcast-flows/api";
  import List, {
    Item,
    Graphic,
    Text,
    PrimaryText,
    SecondaryText,
  } from "@smui/list";

  import { redirectToLoginForAnonymousUsers } from "../lib/auth-routing";
  import { getSavedAccessToken, logout } from "../lib/auth-utils";
  import { PodcastFlowApi } from "../lib/podcast-flow-api";

  redirectToLoginForAnonymousUsers();

  let podcastFlows: Array<PodcastFlow>;

  const accessToken = getSavedAccessToken();
  const flowApi = new PodcastFlowApi();
  flowApi.setAccessToken(accessToken);

  flowApi
    .getAllFlows()
    .then((data) => {
      podcastFlows = data;
    })
    .catch(() => {
      logout();
      redirectToLoginForAnonymousUsers();
    });
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
      </Item>
    {/each}
  </List>
{/if}
