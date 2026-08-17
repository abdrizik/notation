<script lang="ts" module>
  type Example = {
    label: string
    shape: string
    sample: string
    color?: string
  }

  export const shapes: Example[] = [
    {
      label: 'squiggle',
      shape: 'squiggle',
      color: 'var(--color-ink)',
      sample: 'spelled about right'
    },
    {
      label: 'brace',
      shape: 'brace',
      color: 'var(--color-pen-blue)',
      sample: 'read, write, and delete all come from the same token'
    },
    {
      label: 'curved arrow',
      shape: 'curvedArrow',
      color: 'var(--color-pen-blue)',
      sample: 'right here'
    },
    {
      label: 'crop marks',
      shape: 'cropMarks',
      color: 'var(--color-pencil)',
      sample: 'measure twice'
    },
    {
      label: 'circle slash',
      shape: 'circleSlash',
      color: 'var(--color-ink)',
      sample: 'absolutely not'
    },
    {
      label: 'scribble out',
      shape: 'scribbleOut',
      color: 'var(--color-ink)',
      sample: 'struck from the record'
    },
    {
      label: 'caret',
      shape: 'caret',
      color: 'var(--color-pen-blue)',
      sample: 'insert here'
    },
    {
      label: 'checkmark',
      shape: 'checkmark',
      color: 'var(--color-pen-green)',
      sample: 'shipped'
    },
    {
      label: 'star',
      shape: 'star',
      color: 'var(--color-pen-amber)',
      sample: 'worth remembering'
    },
    {
      label: 'speech bubble',
      shape: 'speechBubble',
      color: 'var(--color-pen-blue)',
      sample: 'leave a comment'
    },
    {
      label: 'number badge',
      shape: 'numberBadge',
      color: 'var(--color-pencil)',
      sample: 'first step'
    },
    {
      label: 'letter badge',
      shape: 'calloutsLetterBadge',
      color: 'var(--color-pen-amber)',
      sample: 'see appendix'
    },
    {
      label: 'tolerance bracket',
      shape: 'scienceToleranceBracket',
      color: 'var(--color-pencil)',
      sample: '0.5 mm'
    },
    {
      label: 'star callout',
      shape: 'whiteboardStarCallout',
      color: 'var(--color-pen-amber)',
      sample: 'decision'
    },
    {
      label: 'hatch fill',
      shape: 'deletionHatch',
      color: 'var(--color-ink)',
      sample: 'deprecated API'
    },
    {
      label: 'torn edge',
      shape: 'framesTornEdge',
      color: 'var(--color-pencil)',
      sample: 'ripped from the notebook'
    },
    {
      label: 'double arrow',
      shape: 'pointersDoubleArrow',
      color: 'var(--color-pen-blue)',
      sample: 'the whole span'
    }
  ]
</script>

<script lang="ts">
  import { page } from '$app/state'
  import { getShape } from '$lib/shapes'
  import { Tabs } from '@shardsui/svelte/tabs'
  import { MarkdownNode } from '@comark/svelte'
  import Mark from '$lib/components/mark.svelte'
  import Play from '$lib/components/play.svelte'
  import Pre from './pre.svelte'

  const snippets = $derived(page.data.snippets.shapes)
</script>

<Tabs.Root value={shapes[0].label}>
  <Tabs.List class="tabs" aria-label="Custom shape examples">
    {#each shapes as example (example.label)}
      <Tabs.Tab value={example.label} class="tab">{example.label}</Tabs.Tab>
    {/each}
  </Tabs.List>

  {#each shapes as example (example.label)}
    <Tabs.Panel value={example.label}>
      <div class="card">
        <div class="demo-stage">
          <Play>
            <div class="sample">
              <Mark config={{ type: getShape(example.shape), color: example.color, duration: 900 }}>
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
