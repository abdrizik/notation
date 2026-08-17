<script lang="ts" module>
  import type { AnnotationOptions } from '@shardsui/notation'

  type Example = {
    label: string
    sample: string
    color?: string
    config: AnnotationOptions
  }

  export const options: Example[] = [
    {
      label: 'color',
      sample: 'flagged for review',
      config: { type: 'underline', color: 'var(--color-ink)' }
    },
    {
      label: 'strokeWidth',
      color: 'var(--color-pen-blue)',
      sample: 'this one actually matters',
      config: { type: 'underline', strokeWidth: 5 }
    },
    {
      label: 'padding',
      color: 'var(--color-pencil)',
      sample: 'a box with room to breathe',
      config: { type: 'box', padding: [10, 16] }
    },
    {
      label: 'iterations',
      color: 'var(--color-ink)',
      sample: 'gone over again and again',
      config: { type: 'underline', iterations: 5 }
    },
    {
      label: 'rtl',
      color: 'var(--color-pen-blue)',
      sample: 'the pen starts from the right',
      config: { type: 'underline', rtl: true }
    },
    {
      label: 'wobble',
      color: 'var(--color-pen-amber)',
      sample: 'written in a hurry',
      config: { type: 'underline', wobble: 2.5 }
    },
    {
      label: 'duration',
      color: 'var(--color-pen-green)',
      sample: 'drawn slowly, on purpose',
      config: { type: 'underline', duration: 2500 }
    },
    {
      label: 'side',
      color: 'var(--color-pencil)',
      sample:
        'Both halves of the trade-off matter: ship the smaller change now, and keep the rewrite on the roadmap for later.',
      config: { type: 'bracket', side: ['top', 'bottom'] }
    }
  ]
</script>

<script lang="ts">
  import { page } from '$app/state'
  import { Tabs } from '@shardsui/svelte/tabs'
  import { MarkdownNode } from '@comark/svelte'
  import Mark from '$lib/components/mark.svelte'
  import Play from '$lib/components/play.svelte'
  import Pre from './pre.svelte'

  const snippets = $derived(page.data.snippets.options)
</script>

<Tabs.Root value={options[0].label}>
  <Tabs.List class="tabs" aria-label="Annotation options">
    {#each options as example (example.label)}
      <Tabs.Tab value={example.label} class="tab">{example.label}</Tabs.Tab>
    {/each}
  </Tabs.List>

  {#each options as example (example.label)}
    <Tabs.Panel value={example.label}>
      <div class="card">
        <div class="demo-stage">
          <Play>
            <div class="sample">
              <Mark config={{ ...example.config, color: example.color ?? example.config.color }}>
                {example.sample}
              </Mark>
            </div>
          </Play>
        </div>
        <MarkdownNode node={snippets[example.label]} components={{ Pre }} />
      </div>
    </Tabs.Panel>
  {/each}
</Tabs.Root>
