<script lang="ts">
  import { annotate, type AnnotationOptions } from '@shardsui/notation'
  import type { Snippet } from 'svelte'

  type Props = { children: Snippet }

  let { children }: Props = $props()

  const config: AnnotationOptions = { type: 'circle', color: 'var(--color-ink)', padding: { left: 8, right: 8, top: 4, bottom: 4 } }

  function draw(node: HTMLElement) {
    const annotation = annotate(node, config)
    annotation.show()
    return () => annotation.remove()
  }
</script>

<mark {@attach draw}>{@render children()}</mark>
