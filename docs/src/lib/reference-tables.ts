import type { ElementNode, MarkdownDocument } from 'comark'
import { textContent, visit } from 'comark/utils'

function byTag(node: ElementNode | undefined, ...tags: string[]): ElementNode[] {
  if (!node) return []
  return node
    .slice(2)
    .filter((n): n is ElementNode => Array.isArray(n) && n[0] !== null && tags.includes(n[0]))
}

function first(node: ElementNode | undefined, tag: string) {
  return byTag(node, tag)[0]
}

export function transformReferenceTables(tree: MarkdownDocument): MarkdownDocument {
  visit(
    tree,
    (node) => Array.isArray(node) && node[0] === 'table' && node[1].columns != null,
    (node) => {
      if (!Array.isArray(node) || node[0] === null) return
      if (node[1].columns == null) return
      const columns = String(node[1].columns)

      const headerRow = first(first(node, 'thead'), 'tr')
      if (!headerRow) return

      const labels = byTag(headerRow, 'th', 'td').map((c) => textContent(c))
      const shown = columns.split(',').map((c) => c.trim())
      const summary = labels.map((_, i) => i).filter((i) => shown.includes(labels[i]))

      const rows = byTag(first(node, 'tbody'), 'tr').map((row) => {
        const cells = byTag(row, 'td', 'th')
        return {
          summary: summary.map((i) => cells[i]?.slice(2) ?? []),
          detail: labels.map((label, i) => ({ label, nodes: cells[i]?.slice(2) ?? [] }))
        }
      })

      return ['table', { columns: summary.map((i) => labels[i]), rows }]
    }
  )

  return tree
}
