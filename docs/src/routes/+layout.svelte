<script lang="ts">
  import { asset } from '$app/paths'
  import Header from '$lib/components/header.svelte'
  import SideNav from '$lib/components/side-nav.svelte'
  import '$lib/styles/main.css'

  let { children } = $props()
</script>

<svelte:head>
  <link rel="icon" href={asset('/favicon.svg')} />
  <title>notation — hand-drawn annotations for the web</title>
  <meta
    name="description"
    content="Hand-drawn annotations for the web. Zero dependencies, one function."
  />
</svelte:head>

<a href="#main" class="skip-link">Skip to content</a>

<div class="page">
  <Header />

  <div class="shell">
    <SideNav />

    <main id="main" class="prose">
      {@render children()}

      <footer class="site-footer">
        MIT licensed. Inspired by
        <a href="https://github.com/pshihn/rough-notation" rel="external noopener noreferrer">
          rough-notation
        </a>.
      </footer>
    </main>
  </div>
</div>

<style>
  .page {
    --page-width: 58rem;
    --side-nav-width: 11rem;
    --side-nav-gap: calc(var(--spacing) * 14);

    display: flex;
    flex-direction: column;
    min-block-size: 100dvh;
    padding: calc(var(--spacing) * 4);

    @media (width >= 40rem) {
      padding: calc(var(--spacing) * 8);
    }

    @media (width >= 64rem) {
      padding: calc(var(--spacing) * 12);
    }
  }

  .shell {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: calc(var(--spacing) * 10);

    @media (width >= 64rem) {
      grid-template-columns: var(--side-nav-width) minmax(0, 1fr);
      gap: var(--side-nav-gap);
    }
  }

  .site-footer {
    margin-block-start: calc(var(--spacing) * 16);
    padding-block-start: calc(var(--spacing) * 6);
    border-block-start: var(--border-hairline) solid var(--color-border);
    font-size: var(--text-sm);
    color: var(--color-gray-600);
  }

  .skip-link {
    position: absolute;
    inset-inline-start: calc(var(--spacing) * 4);
    inset-block-start: calc(var(--spacing) * 4);
    z-index: 100;
    padding: calc(var(--spacing) * 2) calc(var(--spacing) * 3);
    border-radius: var(--radius-md);
    background-color: var(--color-content);
    font-size: var(--text-sm);
    font-weight: var(--font-weight-medium);
    outline: var(--focus-ring);
    outline-offset: calc(var(--spacing) * 0.5);
    clip-path: inset(50%);

    &:focus-visible {
      clip-path: none;
    }
  }
</style>
