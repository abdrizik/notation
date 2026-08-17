<script lang="ts">
  import { MarkdownNode, type Node } from '@comark/svelte'
  import { Collapsible } from '@shardsui/svelte/collapsible'
  import type { Snippet } from 'svelte'

  type Row = { summary: Node[][]; detail: Node[] }

  type Props = { columns?: string[]; rows?: Row[]; children?: Snippet }

  let { columns, rows, children }: Props = $props()
</script>

<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<div
  class="table-scroll thin-scrollbar"
  role="region"
  aria-label="{columns?.join(', ') ?? 'Reference'} table"
  tabindex="0"
>
  <table>
    {#if columns && rows}
      <thead>
        <tr>
          {#each columns as column (column)}<th scope="col">{column}</th>{/each}
          <th scope="col"><span class="sr-only">Details</span></th>
        </tr>
      </thead>
      {#each rows as row (row)}
        <Collapsible.Root as="tbody" class="reference-group">
          <tr class="reference-summary">
            {#each row.summary as cell, i (i)}
              <td>{#each cell as node, k (k)}<MarkdownNode {node} />{/each}</td>
            {/each}
            <td class="reference-chevron-cell">
              <Collapsible.Trigger class="reference-toggle">
                <span class="sr-only">Details</span>
              </Collapsible.Trigger>
            </td>
          </tr>
          <tr class="reference-detail">
            <td colspan={columns.length + 1}>
              <Collapsible.Panel class="reference-panel">
                <div class="reference-panel-inner">
                  {#each row.detail as node, k (k)}<MarkdownNode {node} />{/each}
                </div>
              </Collapsible.Panel>
            </td>
          </tr>
        </Collapsible.Root>
      {/each}
    {:else}
      {@render children?.()}
    {/if}
  </table>
</div>

<style>
  .table-scroll {
    margin-block-start: calc(var(--spacing) * 6);
    overflow-x: auto;
    overscroll-behavior-x: contain;

    table {
      min-inline-size: 100%;
      font-size: var(--text-sm);
      line-height: 1.5;
      font-variant-numeric: tabular-nums;
      color: var(--color-gray-700);
    }

    :is(th, td) {
      vertical-align: baseline;
      text-align: start;
      padding: calc(var(--spacing) * 2) calc(var(--spacing) * 3);
      white-space: nowrap;
    }

    th {
      font-weight: var(--font-weight-medium);
      color: var(--color-foreground);
    }

    :is(th, td):first-child {
      padding-inline-start: 0;
    }

    :is(th, td):last-child {
      padding-inline-end: 0;
    }
  }

  .table-scroll :global {
    .reference-group {
      border-block-end: var(--border-hairline) solid var(--color-border);
    }

    .reference-toggle {
      display: block;
      inline-size: 100%;
      block-size: 100%;
      cursor: pointer;
      user-select: none;

      &:focus-visible {
        outline: var(--focus-ring);
        outline-offset: -2px;
      }
    }

    @media (hover: hover) {
      .reference-summary:hover .reference-toggle::after {
        border-color: var(--color-foreground);
      }
    }

    .reference-summary td {
      max-inline-size: 40ch;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .reference-chevron-cell {
      inline-size: calc(var(--spacing) * 10);
      padding-inline-end: calc(var(--spacing) * 0.5);
      text-align: end;
    }

    .reference-toggle::after {
      content: '';
      display: inline-block;
      inline-size: calc(var(--spacing) * 1.6);
      block-size: calc(var(--spacing) * 1.6);
      border-inline-end: 1.5px solid var(--color-gray-500);
      border-block-end: 1.5px solid var(--color-gray-500);
      transform: translateY(calc(var(--spacing) * -0.6)) rotate(45deg);
      transition: transform 150ms ease;
    }

    .reference-toggle[data-panel-open]::after {
      transform: translateY(calc(var(--spacing) * 0.2)) rotate(225deg);
    }

    tr.reference-detail td {
      padding: 0;
    }

    .reference-panel {
      height: var(--collapsible-panel-height);
      overflow: hidden;
      transition: height 200ms ease;
    }

    .reference-panel[data-starting-style],
    .reference-panel[data-ending-style] {
      height: 0;
    }

    .reference-panel[hidden]:not([hidden='until-found']) {
      display: none;
    }

    .reference-panel-inner {
      max-inline-size: 68ch;
      padding: calc(var(--spacing) * 3) calc(var(--spacing) * 4) calc(var(--spacing) * 3.5) 0;
      white-space: normal;
      text-wrap: pretty;
    }

    @media (prefers-reduced-motion: reduce) {
      .reference-panel,
      .reference-toggle::after {
        transition: none;
      }
    }
  }
</style>
