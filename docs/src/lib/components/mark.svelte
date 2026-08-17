<script lang="ts">
  import type { AnnotationOptions } from '@shardsui/notation'
  import { getContext, type Snippet } from 'svelte'
  import { playKey, type PlayContext } from './play.svelte'

  type Props = {
    config: AnnotationOptions
    order?: number
    as?: 'mark' | 'span'
    style?: string
    children: Snippet
  }

  let { config, order = 0, as = 'mark', style, children }: Props = $props()

  const play = getContext<PlayContext>(playKey)

  function register(element: HTMLElement) {
    return play.register({ element, config, order })
  }
</script>

<svelte:element this={as} {style} {@attach register}>{@render children()}</svelte:element>
