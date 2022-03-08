<script lang="ts">
  import Button from "@smui/button";
  import Textfield from "@smui/textfield";
  import Select, { Option } from "@smui/select";
  import type { TimeInterval } from "@podcast-flows/api";
  import PageWithMenu from "../components/PageWithMenu.svelte";
  import ShowsSearchField from "../components/ShowsSearchField.svelte";
  import type { Show } from "../lib/types";

  let name: string | null = null;
  let interval: TimeInterval | null = null;
  // TODO: Investigate why Svelte complained when
  // importing `TIME_INTERVALS` from "@podcast-flows/api"
  const intervals: Array<TimeInterval> = ["daily", "weekly", "monthly"];
  let selectedShows: Show[];

  function submitForm(event: Event): void {
    event.preventDefault();
    alert(
      `Name: ${name}\nInterval: ${interval}\nShows: ${selectedShows
        .map((s) => s.name)
        .join(", ")}`
    );
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
</PageWithMenu>
