import type { Shape } from '@shardsui/notation'

const modules = import.meta.glob<Shape>('./*.ts', {
  import: 'default',
  eager: true
})

const sources = import.meta.glob<string>('./*.ts', {
  query: '?raw',
  import: 'default',
  eager: true
})

function path(name: string): string {
  return `./${name}.ts`
}

export function getShape(name: string): Shape {
  return modules[path(name)]
}

export function getShapeSource(name: string): string {
  const raw = sources[path(name)] ?? ''
  const body = raw
    .replace(/^import type .*\n\n/, '')
    .replace(/\n\nexport default \w+\n?$/, '')
    .trim()
  return `annotate('#el', { type: ${name} }).show()\n\n${body}`
}
