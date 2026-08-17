import type { AnnotationOptions, AnnotationType, Padding, ShapeOptions } from './types.ts'

export interface ResolvedOptions extends ShapeOptions {
  color: string
  strokeWidth: number
  iterations: number
  wobble: number
  rtl: boolean
  multiline: boolean
  duration: number
  delay: number
  easing: string
  seed: number
}

/** The pen accelerates out of the start and eases into the end, the way a hand does. */
const PEN_EASING =
  'linear(0, 0.11 12%, 0.28 26%, 0.44 40%, 0.48 46%, 0.7 64%, 0.86 78%, 0.96 90%, 1)'

const PER_LINE = new Set<AnnotationType>(['underline', 'strike-through', 'highlight'])

export function resolve(options: AnnotationOptions): ResolvedOptions {
  return {
    ...options,
    color: options.color ?? 'currentColor',
    strokeWidth: options.strokeWidth ?? 1.5,
    padding: toFourSides(options.padding),
    iterations: Math.max(1, Math.round(options.iterations ?? 1)),
    wobble: options.wobble ?? 1,
    rtl: options.rtl ?? false,
    multiline: options.multiline ?? isPerLine(options.type),
    duration: Math.max(0, options.duration ?? 800),
    delay: Math.max(0, options.delay ?? 0),
    easing: options.easing ?? PEN_EASING,
    seed: options.seed ?? (Math.random() * 2 ** 32) >>> 0
  }
}

function isPerLine(type: AnnotationOptions['type']): boolean {
  return typeof type !== 'function' && PER_LINE.has(type)
}

function toFourSides(padding: Padding | undefined): [number, number, number, number] {
  if (padding === undefined) return [5, 5, 5, 5]
  if (typeof padding === 'number') return [padding, padding, padding, padding]
  const [top, right = top, bottom = top, left = right] = padding
  return [top, right, bottom, left]
}
