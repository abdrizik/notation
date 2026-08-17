<script lang="ts">
  import { Tabs } from '@shardsui/svelte/tabs'
  import type { Snippet } from 'svelte'

  type Props = { labels: string; children: Snippet }

  let { labels, children }: Props = $props()

  const tabs = $derived(labels.split(',').map((label) => label.trim()))
</script>

<Tabs.Root value={tabs[0]}>
  <Tabs.List class="tabs" aria-label="Framework examples">
    {#each tabs as label (label)}
      <Tabs.Tab value={label} class="tab">{label}</Tabs.Tab>
    {/each}
  </Tabs.List>

  {@render children()}
</Tabs.Root>
