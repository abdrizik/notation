<script lang="ts" module>
  import type { AnnotationOptions } from '@shardsui/notation'

  type Example = {
    label: string
    sample: string
    config: AnnotationOptions
  }

  const types: Example[] = [
    {
      label: 'underline',
      sample: 'the deadline is March 14',
      config: { type: 'underline', color: 'var(--color-pen-blue)' }
    },
    {
      label: 'box',
      sample: 'total due: $1,240',
      config: { type: 'box', color: 'var(--color-pencil)' }
    },
    {
      label: 'circle',
      sample: 'meet at the north entrance',
      config: { type: 'circle', padding: [6, 10], color: 'var(--color-ink)' }
    },
    {
      label: 'highlight',
      sample: 'the second half is what matters',
      config: { type: 'highlight', color: 'var(--color-marker)' }
    },
    {
      label: 'strike-through',
      sample: 'ships in five business days',
      config: { type: 'strike-through', color: 'var(--color-ink)' }
    },
    {
      label: 'crossed-off',
      sample: 'option B: rebuild from scratch',
      config: { type: 'crossed-off', color: 'var(--color-ink)' }
    },
    {
      label: 'bracket',
      sample:
        'Everything above ships in the first release. The rest lands in a follow-up, once the migration is done and the old endpoints are retired.',
      config: { type: 'bracket', side: ['left', 'right'], color: 'var(--color-pen-blue)' }
    },
    {
      label: 'arrow',
      sample: 'start here',
      config: { type: 'arrow', side: 'right', color: 'var(--color-pen-green)' }
    }
  ]
</script>

<script lang="ts">
  import { Tabs } from '@shardsui/svelte/tabs'
  import Mark from '$lib/components/mark.svelte'
  import Play from '$lib/components/play.svelte'
</script>

<Tabs.Root value={types[0].label}>
  <Tabs.List class="tabs" aria-label="Annotation types">
    {#each types as example (example.label)}
      <Tabs.Tab value={example.label} class="tab">{example.label}</Tabs.Tab>
    {/each}
  </Tabs.List>

  {#each types as example (example.label)}
    <Tabs.Panel value={example.label}>
      <div class="card">
        <div class="demo-stage">
          <Play>
            <div class="sample">
              <Mark config={example.config}>{example.sample}</Mark>
            </div>
          </Play>
        </div>
      </div>
    </Tabs.Panel>
  {/each}
</Tabs.Root>
