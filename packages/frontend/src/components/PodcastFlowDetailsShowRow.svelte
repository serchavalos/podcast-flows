<script lang="ts">
  export let imageUrl: string;
  export let name: string;
  export let description: string;
</script>

<div class="flow-row">
  <img src={imageUrl} alt={name} width="65" height="65" />
  <div>
    <strong>{name}</strong>
    <p>{@html description}</p>
  </div>
</div>

<style>
  .flow-row {
    display: flex;
    justify-content: center;
    margin-bottom: 1rem;
  }
  .flow-row > img {
    display: block;
    border: 1px solid;
  }
  .flow-row > div {
    padding: 0 1em;
  }

  strong {
    display: block;
    margin-bottom: 0.5rem;
  }

  p {
    margin: 0;
  }
</style>
