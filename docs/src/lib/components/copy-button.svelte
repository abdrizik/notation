<script lang="ts">
  import TextMorph from '$lib/components/text-morph.svelte'

  type Props = { text: string }

  let { text }: Props = $props()

  let copied = $state(false)
  let timer: ReturnType<typeof setTimeout> | undefined

  $effect(() => () => clearTimeout(timer))

  async function copy() {
    try {
      await navigator.clipboard.writeText(text)
      clearTimeout(timer)
      copied = true
      timer = setTimeout(() => (copied = false), 2000)
    } catch {
      copied = false
    }
  }
</script>

<button type="button" aria-label="Copy code" data-copied={copied ? '' : undefined} onclick={copy}>
  <TextMorph text={copied ? 'copied' : 'copy'} aria-hidden="true" />
  <span class="sr-only" role="status">{copied ? 'Copied' : ''}</span>
</button>

<style>
  button {
    position: absolute;
    cursor: pointer;
    z-index: 2;
    inset-block-start: var(--copy-inset, calc(var(--spacing) * 2));
    inset-inline-end: var(--copy-inset, calc(var(--spacing) * 2));
    block-size: calc(var(--spacing) * 6);
    padding-inline: calc(var(--spacing) * 2);
    font-family: var(--font-sans);
    font-size: var(--text-sm);
    font-weight: 500;
    color: var(--color-gray-700);
    outline: 0;
    user-select: none;
    border-radius: var(--radius-md);

    &:focus-visible {
      outline: var(--focus-ring);
      outline-offset: -1px;
    }

    @media (hover: hover) {
      opacity: var(--copy-opacity, 1);
      transition: opacity 150ms var(--ease-out);
    }
  }
</style>
