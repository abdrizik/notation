<script lang="ts">
  import Mark from '$lib/components/mark.svelte'
  import Play from '$lib/components/play.svelte'
  import type { AnnotationOptions } from '@shardsui/notation'

  const config: AnnotationOptions = {
    type: 'underline',
    multiline: true,
    color: 'var(--color-ink)',
    duration: 1400
  }
</script>

<Play style="max-inline-size: var(--demo-measure)">
  <span style="font-size: var(--text-base); line-height: 2">
    Set <code>multiline</code> and
    <Mark {config}>
      every line box in this wrapped paragraph gets a fresh path of its own, re-measured whenever
      the text reflows around it
    </Mark>
    rather than one stroke stretched across the whole block.
  </span>
</Play>
