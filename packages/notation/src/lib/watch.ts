/**
 * One observer for every annotation on the page. Each tick measures all of them before
 * redrawing any, so fifty annotations cost one reflow per frame instead of fifty.
 */
type Measure = () => Redraw | undefined

type Redraw = () => unknown

const perElement = new WeakMap<Element, Set<Measure>>()
const perDocument = new Set<Measure>()
const pending = new Set<Measure>()
let frame: number | undefined

const observer = globalThis.ResizeObserver
  ? new ResizeObserver((entries) => {
      for (const entry of entries) {
        const measures =
          entry.target === document.documentElement
            ? perDocument
            : (perElement.get(entry.target) ?? [])
        for (const measure of measures) pending.add(measure)
      }
      if (frame === undefined && pending.size > 0) frame = requestAnimationFrame(flush)
    })
  : undefined

function flush(): void {
  frame = undefined
  const redraws: Redraw[] = []
  for (const measure of pending) {
    const redraw = measure()
    if (redraw) redraws.push(redraw)
  }
  pending.clear()
  for (const redraw of redraws) redraw()
}

export function watch(element: Element, measure: Measure): () => void {
  let group = perElement.get(element)
  if (!group) {
    group = new Set()
    perElement.set(element, group)
    observer?.observe(element)
  }
  group.add(measure)

  if (perDocument.size === 0) observer?.observe(document.documentElement)
  perDocument.add(measure)

  return () => {
    pending.delete(measure)
    perDocument.delete(measure)
    if (perDocument.size === 0) observer?.unobserve(document.documentElement)

    group.delete(measure)
    if (group.size === 0) {
      perElement.delete(element)
      observer?.unobserve(element)
    }
  }
}
