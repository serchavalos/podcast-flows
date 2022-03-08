<script lang="ts">
  import { navigate } from "svelte-routing";
  import Fab, { Icon } from "@smui/fab";
  import { Svg } from "@smui/common/elements";
  import SnackbarComponent, { Label } from "@smui/snackbar";
  import { mdiPlus } from "@mdi/js";
  import { notification } from "../stores/notification";
  import PageWithMenu from "../components/PageWithMenu.svelte";
  import PodcastFlowList from "../components/PodcastFlowList.svelte";
  import { redirectToLoginForAnonymousUsers } from "../lib/auth-routing";

  let notificationMessage: string | null;

  //redirectToLoginForAnonymousUsers();
  notification.subscribe((value) => {
    if (!value) {
      return;
    }
    notificationMessage = value;
    setTimeout(() => {
      notificationMessage = null;
    }, 5000);
  });
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

  <SnackbarComponent
    class={!!notificationMessage ? "mdc-snackbar--open" : ""}
    style="bottom: 5rem"
    timeoutMs={5000}
  >
    <Label>{notificationMessage}</Label>
  </SnackbarComponent>
</PageWithMenu>

<style>
  .controls {
    display: flex;
    flex-direction: row-reverse;
    position: fixed;
    right: 1.5rem;
    bottom: 1.5rem;
  }
</style>
