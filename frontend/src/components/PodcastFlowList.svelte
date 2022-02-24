<script lang="ts">
  export let accessToken: string;

  let podcastFlows: Array<Record<string, string>>;

  fetch("http://localhost:8888/api/podcast-flows", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })
    .then((response) => response.json())
    .then((data) => (podcastFlows = data));
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
        <tr>
          <td>{flow.id}</td>
          <td>{flow.name}</td>
          <td>{flow.interval}</td>
        </tr>
      {/each}
    </tbody>
  </table>
{/if}
