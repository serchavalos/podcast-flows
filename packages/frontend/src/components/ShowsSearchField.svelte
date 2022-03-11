<script lang="ts">
  import List, { Item, PrimaryText, SecondaryText, Text } from "@smui/list";
  import Chip, { Set, TrailingIcon } from "@smui/chips";
  import type { MenuComponentDev } from "@smui/menu";
  import Menu from "@smui/menu";
  import Textfield from "@smui/textfield";
  import Icon from "@smui/textfield/icon";
  import HelperText from "@smui/textfield/helper-text";
  import SpotifyWebApi from "spotify-web-api-js";
  import debounce from "lodash.debounce";
  import {
    getSavedAccessToken,
    handleUnauthorizeResponse,
  } from "../lib/auth-utils";
  import type { Show } from "../lib/types";

  const spotifyApi = new SpotifyWebApi();
  const accessToken = getSavedAccessToken();
  let foundShows: Show[] = [];
  let query = "";
  let menu: MenuComponentDev;
  export let selectedShows = [];

  spotifyApi.setAccessToken(accessToken);

  async function searchShows(): Promise<void> {
    if (query === "") {
      return;
    }
    const response = await spotifyApi.searchShows(query);
    foundShows = response.shows.items.map((s) => ({
      id: s.id,
      name: s.name,
      description: s.description,
      imageUrl: s.images[0].url,
    }));
    query = "";
    menu.setOpen(true);
    menu.setDefaultFocusState(2);
  }

  function selectShow(show: Show): void {
    selectedShows = [...selectedShows, show];
  }

  function unselectShow(showId: string): void {
    // TODO: This is triggering an error on the console log, but because
    // Svelte is compiled, I have no idea what the error is referring to
    // (Most likely a race condition because this "Chip" is disappearing before the click
    // handler finishes executing)
    selectedShows = selectedShows.filter((s) => s.id !== showId);
  }
</script>

<p>
  <Textfield
    bind:value={query}
    on:keypress={debounce(searchShows, 500)}
    type="text"
    label="Search for your shows"
  >
    <Icon class="material-icons" slot="trailingIcon">search</Icon>
    <HelperText slot="helper"
      >Type the name of the shows you want to be subscribed</HelperText
    >
  </Textfield>
  {#if foundShows}
    <Menu bind:this={menu}>
      <List twoLine>
        {#each foundShows as show}
          <Item on:SMUI:action={() => selectShow(show)}>
            <Text>
              <PrimaryText>{show.name}</PrimaryText>
              <SecondaryText>{@html show.description}</SecondaryText>
            </Text>
          </Item>
        {/each}
      </List>
    </Menu>
  {/if}
  {#if selectedShows.length > 0}
    <Set chips={selectedShows} let:chip={show} nonInteractive>
      <Chip chip={show}>
        <Text>{show.name}</Text>
        <TrailingIcon
          on:click={() => unselectShow(show.id)}
          class="material-icons">clear</TrailingIcon
        >
      </Chip>
    </Set>
  {/if}
</p>
