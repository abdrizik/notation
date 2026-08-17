<script lang="ts">
  import type { Snippet } from 'svelte'
  import { demos } from './demos'

  type Props = { name: keyof typeof demos; children?: Snippet }

  let { name, children }: Props = $props()

  const Stage = $derived(demos[name])
</script>

<div class="card">
  <div class="demo-stage">
    <Stage />
  </div>
  {@render children?.()}
</div>
