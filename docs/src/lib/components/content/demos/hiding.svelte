<script lang="ts">
  import Mark from '$lib/components/mark.svelte'
  import Play from '$lib/components/play.svelte'
  import type { AnnotationOptions } from '@shardsui/notation'

  const config: AnnotationOptions = { type: 'box', color: 'var(--color-ink)', duration: 600 }
</script>

<Play>
  <span style="font-size: var(--text-lg)">
    <Mark {config}>this sentence runs long</Mark>
  </span>
</Play>
