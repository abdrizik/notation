import type { AnnotationOptions, AnnotationType, Point, Rect, Shape, Side, Spine } from './types.ts'
import type { ResolvedOptions } from './options.ts'
import { createHand, type Trace } from './hand.ts'

export interface Stroke extends Omit<Trace, 'pressure'> {
  width: number
  opacity: number
  cap: 'round' | 'butt'
}

const PEN = { wobble: 1, opacity: 1, cap: 'round' } as const
const MARKER = { wobble: 0.75, opacity: 0.85, cap: 'butt' } as const

export function isMarker(type: AnnotationOptions['type']): boolean {
  return type === 'highlight'
}
function across(rect: Rect, y: number): Point[] {
  return [
    [rect.x, y],
    [rect.x + rect.w, y]
  ]
}

const SHAPES: Record<AnnotationType, Shape> = {
  underline: (rect, { padding: [, , bottom] }) => [across(rect, rect.y + rect.h + bottom)],

  'strike-through': (rect) => [across(rect, rect.y + rect.h / 2)],

  highlight: (rect) => [{ points: across(rect, rect.y + rect.h / 2), width: rect.h * 0.95 }],

  box: (rect, { padding }) => {
    const { x, y, w, h } = padded(rect, padding)
    const corners: Point[] = [
      [x, y],
      [x + w, y],
      [x + w, y + h],
      [x, y + h]
    ]
    return corners.map((corner, edge) => ({
      points: [corner, corners[(edge + 1) % 4]],
      overshoot: true
    }))
  },

  'crossed-off': (rect) => {
    const right = rect.x + rect.w
    const bottom = rect.y + rect.h
    return [
      [
        [rect.x, rect.y],
        [right, bottom]
      ],
      [
        [right, rect.y],
        [rect.x, bottom]
      ]
    ]
  },

  circle: (rect, { padding }) => {
    const { x, y, w, h } = padded(rect, padding)
    const rx = Math.abs(w * 1.1) / 2
    const ry = Math.abs(h * 1.25) / 2
    const cx = x + w / 2
    const cy = y + h / 2
    const steps = Math.max(16, Math.ceil((Math.PI * (rx + ry)) / 12))
    const ring: Point[] = []
    for (let i = 0; i < steps; i++) {
      const a = (i / steps) * Math.PI * 2
      ring.push([cx + rx * Math.cos(a), cy + ry * Math.sin(a)])
    }
    return [{ points: ring, closed: true }]
  },

  bracket: (rect, { padding, side }) => {
    const sides = Array.isArray(side) ? side : [side ?? 'right']
    const outer = padded(rect, padding, 2)
    return sides.map((side) => BRACKET[side](rect, outer))
  },

  arrow: (rect, { padding, side }) => {
    const from = (Array.isArray(side) ? side[0] : side) ?? 'left'
    const { tip, angle } = ARROW_TIP[from](padded(rect, padding, 2))
    const length = Math.min(96, Math.max(48, rect.h * 1.6))
    const shaft: Point = [tip[0] - length * Math.cos(angle), tip[1] - length * Math.sin(angle)]
    const flick = Math.min(14, length * 0.4)
    return [
      [shaft, tip],
      ...[0.5, -0.5].map((spread): Point[] => {
        const back = angle + Math.PI + spread
        return [tip, [tip[0] + flick * Math.cos(back), tip[1] + flick * Math.sin(back)]]
      })
    ]
  }
}

export function toStrokes(rects: Rect[], options: ResolvedOptions): Stroke[] {
  const spines = toSpines(rects, options)

  const tool = isMarker(options.type) ? MARKER : PEN
  const stroke = createHand(options.seed, options.wobble * tool.wobble)

  const strokes: Stroke[] = []
  for (let pass = 0; pass < options.iterations; pass++) {
    // alternate direction each pass, the way a hand goes back and forth
    const forward = (pass % 2 === 0) !== options.rtl
    for (const spine of spines) {
      const points = forward ? spine.points : spine.points.toReversed()
      const { pressure, ...drawn } = stroke({ ...spine, points })
      strokes.push({
        ...drawn,
        // a shape that sets its own width means it, so pressure does not apply
        width: spine.width ?? options.strokeWidth * pressure,
        opacity: (pass === 0 ? 1 : 0.75) * tool.opacity,
        cap: tool.cap
      })
    }
  }
  return strokes
}

function toSpines(rects: Rect[], options: ResolvedOptions): Spine[] {
  const shape = toShape(options.type)

  return (options.multiline ? rects : [union(rects)])
    .flatMap((rect) => shape(rect, options))
    .map((stroke) => (Array.isArray(stroke) ? { points: stroke } : stroke))
    .filter((spine) => spine.points.length >= 2)
}

export function toShape(type: AnnotationOptions['type']): Shape {
  const shape = typeof type === 'function' ? type : SHAPES[type]
  if (!shape) throw new Error(`notation: unknown type "${type}"`)
  return shape
}

function padded(
  rect: Rect,
  [top, right, bottom, left]: ResolvedOptions['padding'],
  scale = 1
): Rect {
  return {
    x: rect.x - left * scale,
    y: rect.y - top * scale,
    w: rect.w + (left + right) * scale,
    h: rect.h + (top + bottom) * scale
  }
}

function union(rects: Rect[]): Rect {
  const left = Math.min(...rects.map((r) => r.x))
  const top = Math.min(...rects.map((r) => r.y))
  const right = Math.max(...rects.map((r) => r.x + r.w))
  const bottom = Math.max(...rects.map((r) => r.y + r.h))
  return { x: left, y: top, w: right - left, h: bottom - top }
}

const ARROW_TIP: Record<Side, (rect: Rect) => { tip: Point; angle: number }> = {
  left: ({ x, y, h }) => ({ tip: [x, y + h / 2], angle: 0 }),
  right: ({ x, y, w, h }) => ({ tip: [x + w, y + h / 2], angle: Math.PI }),
  top: ({ x, y, w }) => ({ tip: [x + w / 2, y], angle: Math.PI / 2 }),
  bottom: ({ x, y, w, h }) => ({ tip: [x + w / 2, y + h], angle: -Math.PI / 2 })
}

const BRACKET: Record<Side, (rect: Rect, outer: Rect) => Point[]> = {
  top: (rect, outer) => [
    [outer.x, rect.y],
    [outer.x, outer.y],
    [outer.x + outer.w, outer.y],
    [outer.x + outer.w, rect.y]
  ],
  bottom: (rect, outer) => [
    [outer.x, rect.y + rect.h],
    [outer.x, outer.y + outer.h],
    [outer.x + outer.w, outer.y + outer.h],
    [outer.x + outer.w, rect.y + rect.h]
  ],
  left: (rect, outer) => [
    [rect.x, outer.y],
    [outer.x, outer.y],
    [outer.x, outer.y + outer.h],
    [rect.x, outer.y + outer.h]
  ],
  right: (rect, outer) => [
    [rect.x + rect.w, outer.y],
    [outer.x + outer.w, outer.y],
    [outer.x + outer.w, outer.y + outer.h],
    [rect.x + rect.w, outer.y + outer.h]
  ]
}
