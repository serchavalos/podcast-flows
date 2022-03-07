<script lang="ts">
  import PageWithMenu from "../components/PageWithMenu.svelte";
  import PodcastFlowList from "../components/PodcastFlowList.svelte";
  import { redirectToLoginForAnonymousUsers } from "../lib/auth-routing";

  redirectToLoginForAnonymousUsers();
</script>

<PageWithMenu>
  <p>Your Flows</p>
  <p>
    <PodcastFlowList />
  </p>
</PageWithMenu>
