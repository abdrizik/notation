<script lang="ts">
  import Mark from '$lib/components/mark.svelte'
  import Play from '$lib/components/play.svelte'
  import type { AnnotationOptions } from '@shardsui/notation'

  const underline: AnnotationOptions = {
    type: 'underline',
    color: 'var(--color-ink)',
    duration: 450
  }
</script>

<Play style="max-inline-size: var(--demo-measure)">
  <span style="font-size: var(--text-base); line-height: 2.2">
    One call underlines the <Mark order={1} config={underline}>first</Mark> target, then the
    <Mark order={2} config={underline}>second</Mark>, then the
    <Mark order={3} config={underline}>third</Mark> — drawn in order, hidden together.
  </span>
</Play>
