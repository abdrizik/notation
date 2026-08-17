import source from '$content/index.md?raw'
import { options } from '$lib/components/content/options.svelte'
import { shapes } from '$lib/components/content/shapes.svelte'
import { plugins } from '$lib/markdown'
import { transformReferenceTables } from '$lib/reference-tables'
import { getShapeSource } from '$lib/shapes'
import type { AnnotationOptions } from '@shardsui/notation'
import { parseMarkdown } from 'comark/parse'

export const prerender = true

type Literal = string | number | boolean | Literal[]

function toLiteral(value: Literal): string {
  if (typeof value === 'string') return `'${value}'`
  if (Array.isArray(value)) return `[${value.map(toLiteral).join(', ')}]`
  return String(value)
}

/** Renders the config that draws a demo, with the option it demonstrates highlighted. */
function toSource(config: AnnotationOptions, highlight: string): string {
  const fields = Object.entries(config).map(
    ([key, value]) =>
      `  ${key}: ${toLiteral(value)},${key === highlight ? ' // [!code highlight]' : ''}`
  )
  return `const a = annotate('#el', {\n${fields.join('\n')}\n})\n\na.show()`
}

async function block(code: string) {
  const { nodes } = await parseMarkdown(`\`\`\`js\n${code}\n\`\`\``, { plugins })
  return nodes[0]
}

async function snippets<T extends { label: string }>(items: T[], toCode: (item: T) => string) {
  const entries = await Promise.all(
    items.map(async (item) => [item.label, await block(toCode(item))] as const)
  )
  return Object.fromEntries(entries)
}

export async function load() {
  return {
    tree: transformReferenceTables(await parseMarkdown(source.trim(), { plugins })),
    snippets: {
      options: await snippets(options, (option) => toSource(option.config, option.label)),
      shapes: await snippets(shapes, (shape) => getShapeSource(shape.shape))
    }
  }
}
