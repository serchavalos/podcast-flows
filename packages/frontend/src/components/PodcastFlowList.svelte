<script lang="ts">
  import { navigate } from "svelte-routing";
  import type { PodcastFlow } from "@podcast-flows/api";

  import { redirectToLoginForAnonymousUsers } from "../lib/auth-routing";
  import { PodcastFlowApi } from "../lib/podcast-flow-api";

  redirectToLoginForAnonymousUsers();

  let podcastFlows: Array<PodcastFlow>;

  const accessToken = localStorage.getItem("access_token");
  const flowApi = new PodcastFlowApi();
  flowApi.setAccessToken(accessToken);

  flowApi.getAllFlows().then((data) => {
    podcastFlows = data;
  });
</script>

{#if podcastFlows}
  <table>
    <thead>
      <td>id</td>
      <td>name</td>
      <td>interval</td>
    </thead>
    <tbody>
      {#each podcastFlows as flow}
        <tr on:click={() => navigate(`/flow/${flow.id}`)}>
          <td>{flow.id}</td>
          <td>{flow.name}</td>
          <td>{flow.interval}</td>
        </tr>
      {/each}
    </tbody>
  </table>
{/if}
