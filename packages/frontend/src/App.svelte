<script lang="ts">
  import { Router, Route } from "svelte-routing";
  import Login from "./pages/Login.svelte";
  import Account from "./pages/Account.svelte";
  import PodcastFlowDetails from "./pages/PodcastFlowDetails.svelte";
</script>

<main>
  <h1>Podcast Flow</h1>

  <Router>
    <Route path="/login" component={Login} />
    <Route path="/flow/:flowId" component={PodcastFlowDetails} />
    <Route path="/" component={Account} />
  </Router>
</main>

<style>
  :global(body) {
    display: flex;
    height: 100vh;
    max-width: 393px;
    margin: 0 auto;
  }
  main {
    margin: auto;
    text-align: center;
    padding: 1em;
  }
</style>
