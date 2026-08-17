import type { Annotation, AnnotationOptions, Target } from './types.ts'
import { createAnnotation } from './annotation.ts'
import { group } from './group.ts'

export type * from './types.ts'

type Entry = [Target, AnnotationOptions]

export function annotate(target: Target, options: AnnotationOptions): Annotation
export function annotate(entries: Entry[]): Annotation
export function annotate(target: Target | Entry[], options?: AnnotationOptions): Annotation {
  const entries: Entry[] = Array.isArray(target) ? target : [[target, options!]]
  const annotations = entries.flatMap(([target, options]) =>
    findElements(target).map((element) => createAnnotation(element, options))
  )
  return annotations.length === 1 ? annotations[0] : group(annotations)
}

function findElements(target: Target): HTMLElement[] {
  if (typeof target !== 'string') return [target]
  const found = document.querySelectorAll<HTMLElement>(target)
  if (found.length === 0) console.warn(`notation: no element matches "${target}"`)
  return [...found]
}
