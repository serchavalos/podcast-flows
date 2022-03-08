<script lang="ts">
  import List, { Item, PrimaryText, SecondaryText, Text } from "@smui/list";
  import Chip, { Set } from "@smui/chips";
  import type { MenuComponentDev } from "@smui/menu";
  import Menu from "@smui/menu";
  import Textfield from "@smui/textfield";
  import Icon from "@smui/textfield/icon";
  import HelperText from "@smui/textfield/helper-text";
  import SpotifyWebApi from "spotify-web-api-js";
  import debounce from "lodash.debounce";
  import { getSavedAccessToken } from "../lib/auth-utils";
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

  function selectShow(show: Show) {
    selectedShows = [...selectedShows, show];
    console.log(selectedShows.length);
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
    <Set chips={selectedShows.map((s) => s.name)} let:chip nonInteractive>
      <Chip {chip}>
        <Text>{chip}</Text>
      </Chip>
    </Set>
  {/if}
</p>
<!--

  <Autocomplete search={searchShows} showMenuWithNoInput={false} label="Shows">
    <Text
      slot="loading"
      style="display: flex; width: 100%; justify-content: center; align-items: center;"
    >
      <CircularProgress style="height: 24px; width: 24px;" indeterminate />
    </Text>
  </Autocomplete>
-->
