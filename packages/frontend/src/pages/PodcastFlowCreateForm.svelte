<script lang="ts">
  import { navigate } from "svelte-routing";
  import Button from "@smui/button";
  import Textfield from "@smui/textfield";
  import Select, { Option } from "@smui/select";
  import Snackbar, { Actions, Label } from "@smui/snackbar";
  import type { SnackbarComponentDev } from "@smui/snackbar";
  import IconButton from "@smui/icon-button";
  import type { TimeInterval } from "@podcast-flows/api";
  import { notification } from "../stores/notification";
  import PageWithMenu from "../components/PageWithMenu.svelte";
  import ShowsSearchField from "../components/ShowsSearchField.svelte";
  import { PodcastFlowApi } from "../lib/podcast-flow-api";
  import { getSavedAccessToken, logout } from "../lib/auth-utils";
  import type { Show } from "../lib/types";

  // TODO: Investigate why Svelte complained when
  // importing `TIME_INTERVALS` from "@podcast-flows/api"
  const intervals: Array<TimeInterval> = ["daily", "weekly", "monthly"];
  let name: string | null = null;
  let interval: TimeInterval | null = null;
  let errorBar: SnackbarComponentDev;
  let errorMessage: string;
  const accessToken = getSavedAccessToken();
  const api = new PodcastFlowApi();
  api.setAccessToken(accessToken);

  let selectedShows: Show[];

  async function submitForm(event: Event): Promise<void> {
    event.preventDefault();
    const flow = {
      name,
      interval,
      showIds: selectedShows.map((s) => s.id),
    };

    const response = await api.createNewFlow(flow);
    if (response.error) {
      errorMessage =
        response.error.message || "Something went wrong. Try later";
      errorBar.open();
    } else {
      notification.set("Your new podcast flow has been created!");
      navigate("/");
    }
  }
</script>

<PageWithMenu>
  <h1>Create new podcast flow</h1>
  <form method="post" on:submit={submitForm}>
    <p>
      <Textfield
        type="text"
        bind:value={name}
        label="Podcast Flow Name"
        style="min-width: 250px;"
        input$autocomplete="email"
      />
    </p>
    <p>
      <ShowsSearchField bind:selectedShows />
    </p>
    <p>
      <Select bind:value={interval} label="Interval">
        {#each intervals as interval}
          <Option value={interval}>{interval}</Option>
        {/each}
      </Select>
    </p>
    <p>
      <Button variant="raised" type="submit" class="button-shaped-round"
        >Create</Button
      >
    </p>
  </form>

  <Snackbar bind:this={errorBar} timeoutMs={5000}>
    <Label>{errorMessage}</Label>
    <Actions>
      <IconButton class="material-icons" title="Dismiss">close</IconButton>
    </Actions>
  </Snackbar>
</PageWithMenu>
