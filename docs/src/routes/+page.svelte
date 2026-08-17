<script lang="ts">
  import { components } from '$lib/components/content/components'
  import { MarkdownNode } from '@comark/svelte'

  let { data } = $props()
</script>

{#each data.tree.nodes as node, i (i)}
  <MarkdownNode {node} {components} />
{/each}
