<script lang="ts">
  import { Tabs } from '@shardsui/svelte/tabs'
  import type { Snippet } from 'svelte'

  type Props = { label: string; children: Snippet }

  let { label, children }: Props = $props()
</script>

<Tabs.Panel value={label}>
  {@render children()}
</Tabs.Panel>
