<script lang="ts">
  import CopyButton from '$lib/components/copy-button.svelte'
  import type { Snippet } from 'svelte'

  type Props = { children?: Snippet; class?: string; language?: string }

  let { children, class: classes, language }: Props = $props()

  let rendered = $state<HTMLPreElement>()

  const text = $derived(rendered?.textContent ?? '')
</script>

<div class="code-block">
  <pre bind:this={rendered} class="thin-scrollbar {classes}" data-language={language}>{@render children?.()}</pre>
  <CopyButton {text} />
</div>

<style>
  /* The frame is a card of its own, unless an enclosing card already draws one. */
  .code-block {
    --inner-radius: var(--radius-md);
    --frame: var(--code-frame, var(--spacing));
    --copy-inset: calc(var(--spacing) * 2 + var(--frame));

    position: relative;
    margin-block-start: var(--code-frame-gap, calc(var(--spacing) * 6));
    padding: var(--frame);
    background-color: var(--code-frame-color, var(--color-gray-100));
    border-radius: calc(var(--inner-radius) + var(--frame));

    @media (hover: hover) {
      --copy-opacity: 0;
    }

    &:hover,
    &:focus-within {
      --copy-opacity: 1;
    }
  }

  pre {
    display: flex;
    background-color: var(--color-content);
    border-radius: var(--inner-radius, var(--radius-md));
    font-family: var(--font-mono);
    font-size: var(--text-code);
    line-height: var(--text-code--line-height);
    color: var(--color-foreground);
    padding-block: calc(var(--spacing) * 3);
    overflow-x: auto;
    overscroll-behavior-x: contain;

    :global(code) {
      display: grid;
      flex-grow: 1;
      white-space: normal;
    }

    :global(code .line) {
      white-space: pre;
      padding-inline: calc(var(--spacing) * 4);
    }

    :global(code .line:empty) {
      block-size: 1lh;
    }
  }
</style>
