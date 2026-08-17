import type { Annotation, AnnotationOptions } from './types.ts'

export function group(annotations: Annotation[]): Annotation {
  let sequence = 0
  let finished = Promise.resolve()

  async function drawInTurn(): Promise<void> {
    const current = ++sequence
    for (const annotation of annotations) {
      if (current !== sequence) return
      await annotation.show().finished
    }
  }

  async function retractTogether(): Promise<void> {
    await Promise.all(annotations.map((annotation) => annotation.hide().finished))
  }

  const grouped: Annotation = {
    get showing() {
      return annotations.some((annotation) => annotation.showing)
    },

    get finished() {
      return finished
    },

    update(options: Partial<AnnotationOptions>) {
      for (const annotation of annotations) annotation.update(options)
      return grouped
    },

    show() {
      finished = drawInTurn()
      return grouped
    },

    hide() {
      sequence++
      finished = retractTogether()
      return grouped
    },

    remove() {
      sequence++
      finished = Promise.resolve()
      for (const annotation of annotations) annotation.remove()
    }
  }

  return grouped
}
