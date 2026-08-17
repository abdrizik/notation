<script lang="ts" module>
  import type { AnnotationOptions } from '@shardsui/notation'

  export type MarkEntry = {
    element: HTMLElement
    config: AnnotationOptions
    order: number
  }

  export type PlayContext = {
    register(entry: MarkEntry): () => void
  }

  export const playKey = Symbol('play')
</script>

<script lang="ts">
  import TextMorph from '$lib/components/text-morph.svelte'
  import { annotate, type Annotation } from '@shardsui/notation'
  import { setContext, type Snippet } from 'svelte'

  type Props = { children: Snippet; style?: string }

  let { children, style }: Props = $props()

  const marks: MarkEntry[] = []
  let revealed = $state(false)
  let shown = $state(false)
  let group: Annotation | undefined

  setContext<PlayContext>(playKey, {
    register(entry) {
      marks.push(entry)
      return () => {
        const index = marks.indexOf(entry)
        if (index >= 0) marks.splice(index, 1)
      }
    }
  })

  $effect(() => {
    if (!revealed || marks.length === 0) return
    const entries = [...marks]
      .sort((a, b) => a.order - b.order)
      .map((mark): [HTMLElement, AnnotationOptions] => [mark.element, mark.config])
    const annotation = annotate(entries)
    annotation.show()
    group = annotation
    shown = true
    return () => {
      annotation.remove()
      group = undefined
      shown = false
    }
  })

  function onReveal(node: HTMLElement) {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          observer.unobserve(entry.target)
          revealed = true
        }
      },
      { rootMargin: '0px 0px -20% 0px' }
    )
    observer.observe(node)
    return () => observer.disconnect()
  }

  function toggle() {
    if (!group) {
      revealed = true
      return
    }
    if (shown) group.hide()
    else group.show()
    shown = !shown
  }
</script>

<div {style} {@attach onReveal}>
  {@render children()}
</div>

<button type="button" class="demo-control" onclick={toggle}>
  <TextMorph text={shown ? 'Hide' : 'Show'} />
</button>
