<script lang="ts">
  import { navigate } from "svelte-routing";

  export let accessToken: string;
  if (!accessToken) {
    navigate("/login");
  }

  let podcastFlows: Array<Record<string, string>>;

  fetch("http://localhost:8888/api/podcast-flows", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })
    .then((response) => response.json())
    .then((data) => {
      podcastFlows = data;
    });

  const navigateToFlowDetails = (id: string) => {
    navigate(`/flow/${id}`);
  };
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
        <tr on:click={() => navigateToFlowDetails(flow.id)}>
          <td>{flow.id}</td>
          <td>{flow.name}</td>
          <td>{flow.interval}</td>
        </tr>
      {/each}
    </tbody>
  </table>
{/if}
