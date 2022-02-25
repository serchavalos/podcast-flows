<script lang="ts">
  import { navigate } from "svelte-routing";

  import { redirectToLoginForAnonymousUsers } from "../lib/auth-routing";

  redirectToLoginForAnonymousUsers();

  let podcastFlows: Array<Record<string, string>>;
  const accessToken = localStorage.getItem("access_token");

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
