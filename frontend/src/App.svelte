<script lang="ts">
  import { Router, Route } from "svelte-routing";
  import Login from "./pages/Login.svelte";
  import Account from "./pages/Account.svelte";
  import PodcastFlowDetails from "./pages/PodcastFlowDetails.svelte";

  const accessToken = localStorage.getItem("access_token");
</script>

<main>
  <h1>Podcast Flow</h1>
  {#if !accessToken}
    <Login />
  {:else}
    <Account />
  {/if}
  <Router>
    <Route path="flow/:flowId" component={PodcastFlowDetails} />
  </Router>
</main>

<style>
  :global(body) {
    display: flex;
    height: 100vh;
  }
  main {
    margin: auto;
    text-align: center;
    padding: 1em;
  }
</style>
