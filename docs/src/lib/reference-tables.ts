import type { ElementNode, MarkdownDocument } from 'comark'
import { textContent, visit } from 'comark/utils'

function children(node: ElementNode | undefined, ...tags: string[]): ElementNode[] {
  if (!node) return []
  return node
    .slice(2)
    .filter(
      (child): child is ElementNode => Array.isArray(child) && tags.includes(child[0] as string)
    )
}

function child(node: ElementNode | undefined, tag: string) {
  return children(node, tag)[0]
}

/**
 * A table marked `::table{columns="Option,Type,Default"}` keeps the listed columns in the summary
 * row and moves the rest into a panel the row expands to reveal.
 */
export function transformReferenceTables(tree: MarkdownDocument): MarkdownDocument {
  visit(
    tree,
    (node) => Array.isArray(node) && node[0] === 'table' && node[1].columns != null,
    (node) => {
      if (!Array.isArray(node) || node[0] !== 'table') return

      const header = child(child(node, 'thead'), 'tr')
      if (!header) return

      const labels = children(header, 'th').map((cell) => textContent(cell))
      const shown = String(node[1].columns)
        .split(',')
        .map((label) => label.trim())
      const summary = labels.flatMap((label, index) => (shown.includes(label) ? [index] : []))
      const detail = labels.flatMap((label, index) => (shown.includes(label) ? [] : [index]))

      const rows = children(child(node, 'tbody'), 'tr').map((row) => {
        const cells = children(row, 'td')
        return {
          summary: summary.map((index) => cells[index]?.slice(2) ?? []),
          detail: detail.flatMap((index) => cells[index]?.slice(2) ?? [])
        }
      })

      return ['table', { columns: summary.map((index) => labels[index]), rows }]
    }
  )

  return tree
}
