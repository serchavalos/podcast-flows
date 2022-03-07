<script lang="ts">
  import { Router, Route } from "svelte-routing";

  import Login from "./pages/Login.svelte";
  import Account from "./pages/Account.svelte";
  import PodcastFlowDetails from "./pages/PodcastFlowDetails.svelte";
</script>

<Router>
  <Route path="/login" component={Login} />
  <Route path="/flow/:flowId" component={PodcastFlowDetails} />
  <Route path="/" component={Account} />
</Router>

<style>
  :global(body) {
    margin: 0;
    font-family: Roboto;
  }
</style>
