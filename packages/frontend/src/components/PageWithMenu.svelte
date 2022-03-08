<script lang="ts">
  import { navigate } from "svelte-routing";
  import Drawer, { Content, Header } from "@smui/drawer";
  import List, { Item, Text, Graphic, Separator } from "@smui/list";
  import TopAppBar, { Row, Section, Title } from "@smui/top-app-bar";
  import IconButton from "@smui/icon-button";

  import { redirectToLoginForAnonymousUsers } from "../lib/auth-routing";
  import { getSavedUser, logout, User } from "../lib/auth-utils";

  let user: User;
  getSavedUser().then((savedUser) => (user = savedUser));

  let open = false;

  function toggleDrawer(): void {
    open = !open;
  }

  function closeMenu(): void {
    open = false;
  }

  function logUserOut(): void {
    open = false;
    logout();
    redirectToLoginForAnonymousUsers();
  }
</script>

<TopAppBar>
  <Row>
    <Section>
      <IconButton class="material-icons" on:click={() => toggleDrawer()}
        >menu</IconButton
      >
      <Title>Podcast Flow</Title>
    </Section>
  </Row>
</TopAppBar>

<Drawer variant="modal" fixed={false} bind:open>
  <Header class="header">
    {#if user}
      <p class="avatar-container">
        <img
          class="avatar-icon"
          src={user.imageUrl}
          alt={`Avatar for ${user.displayName}`}
        />
        <Title>{user.displayName}</Title>
      </p>
    {/if}
  </Header>
  <Separator />
  <Content>
    <List>
      <Item
        on:click={() => {
          navigate("/");
          toggleDrawer();
        }}
      >
        <Graphic class="material-icons" aria-hidden="true">home</Graphic>
        <Text>My flows</Text>
      </Item>
      <Item href="javascript:void(0)" on:click={() => logUserOut()}>
        <Graphic class="material-icons" aria-hidden="true">logout</Graphic>
        <Text>Logout</Text>
      </Item>
    </List>
  </Content>
</Drawer>

<main on:click={() => closeMenu()}>
  <slot />
</main>

<style>
  main {
    min-height: 100vh;
    padding: 3.5rem 1rem 1rem 1rem;
  }

  .avatar-container {
    padding: 1rem 0.5rem 0 0.5rem;
    margin: 0 auto;
    text-align: center;
  }

  .avatar-icon {
    height: 9rem;
    width: 9rem;
    border-radius: 50%;
  }
</style>
