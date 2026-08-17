<script lang="ts">
  import Mark from '$lib/components/mark.svelte'
  import Play from '$lib/components/play.svelte'
  import type { AnnotationOptions } from '@shardsui/notation'

  const box: AnnotationOptions = {
    type: 'box',
    padding: [4, 6],
    color: 'var(--color-ink)',
    duration: 450
  }
  const circle: AnnotationOptions = {
    type: 'circle',
    padding: [2, 6],
    color: 'var(--color-ink)',
    duration: 400
  }
  const highlight: AnnotationOptions = {
    type: 'highlight',
    color: 'var(--color-marker)',
    duration: 450
  }
  const underline: AnnotationOptions = { type: 'underline', multiline: true, duration: 450 }
</script>

<Play>
  <Mark
    as="span"
    order={9}
    style="display: block; max-inline-size: var(--demo-measure); font-family: var(--font-mono); font-size: var(--text-code); line-height: 2.4;"
    config={box}
  >
    annotate(<Mark order={1} config={circle}>'.term'</Mark>, &#123; type:
    <Mark order={2} config={highlight}>'underline'</Mark> &#125;)<br />
    &nbsp;&nbsp;.<Mark order={3} config={underline}>show()</Mark><br />
    <br />
    target &nbsp;→ circled &nbsp;&nbsp;type → banded &nbsp;&nbsp;call → underlined
  </Mark>
</Play>
