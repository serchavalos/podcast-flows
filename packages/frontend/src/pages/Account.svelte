<script lang="ts">
  import Fab, { Icon } from "@smui/fab";
  import { Svg } from "@smui/common/elements";
  import { mdiPlus } from "@mdi/js";
  import PageWithMenu from "../components/PageWithMenu.svelte";
  import PodcastFlowList from "../components/PodcastFlowList.svelte";
  import { redirectToLoginForAnonymousUsers } from "../lib/auth-routing";
  import { navigate } from "svelte-routing";

  redirectToLoginForAnonymousUsers();
</script>

<PageWithMenu>
  <h2>Your Flows</h2>
  <div>
    <PodcastFlowList />
  </div>
  <div class="controls">
    <Fab on:click={() => navigate("/new")}>
      <Icon component={Svg} viewBox="2 2 20 20">
        <path fill="currentColor" d={mdiPlus} />
      </Icon>
    </Fab>
  </div>
</PageWithMenu>

<style>
  .controls {
    display: flex;
    flex-direction: row-reverse;
  }
</style>
