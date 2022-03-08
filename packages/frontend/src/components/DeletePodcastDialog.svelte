<script lang="ts">
  import Dialog, { Title, Content, Actions } from "@smui/dialog";
  import Button, { Label } from "@smui/button";
  import { getSavedAccessToken } from "../lib/auth-utils";
  import { PodcastFlowApi } from "../lib/podcast-flow-api";

  export let flowId: string | null = null;
  export let onPodcastFlowDeleted: (flowId: string) => void | null;
  $: warningDialogOpen = flowId !== null;

  const accessToken = getSavedAccessToken();
  const flowApi = new PodcastFlowApi();
  flowApi.setAccessToken(accessToken);

  function cancelFlowDeletion(): void {
    flowId = null;
    warningDialogOpen = false;
  }

  function confirmPodcastFlowDeletion(): void {
    flowApi.deleteFlow(flowId).then(() => {
      if (onPodcastFlowDeleted) {
        onPodcastFlowDeleted(flowId);
      }
      flowId = null;
      warningDialogOpen = false;
    });
  }
</script>

<Dialog
  bind:open={warningDialogOpen}
  aria-labelledby="simple-title"
  aria-describedby="simple-content"
>
  <Title id="simple-title">Are you sure you want to delete this flow?</Title>
  <Content id="simple-content">There is no way back after this</Content>
  <Actions>
    <Button on:click={cancelFlowDeletion}>
      <Label>Cancel</Label>
    </Button>
    <Button on:click={confirmPodcastFlowDeletion}>
      <Label>Yes</Label>
    </Button>
  </Actions>
</Dialog>
