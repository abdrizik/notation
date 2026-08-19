import type { AnnotationType, Point, Rect, ShapeEntry, Side, Sides, Spine, Tool } from './types'

export const PEN: Tool = { wobble: 1, opacity: 1, cap: 'round' }
export const MARKER: Tool = { wobble: 0.75, opacity: 0.85, cap: 'butt' }

function line(from: Point, to: Point): Spine {
  return { points: [from, to] }
}

function across(rect: Rect, y: number): Spine {
  return line([rect.x, y], [rect.x + rect.w, y])
}

export const SHAPES: Record<AnnotationType, ShapeEntry> = {
  underline: {
    perLine: true,
    draw: (rect, { padding }) => [across(rect, rect.y + rect.h + padding.bottom)]
  },

  'strike-through': { perLine: true, draw: (rect) => [across(rect, rect.y + rect.h / 2)] },

  highlight: {
    tool: MARKER,
    perLine: true,
    draw: (rect) => [{ ...across(rect, rect.y + rect.h / 2), width: rect.h * 0.95 }]
  },

  box: {
    draw: (rect, { padding }) => {
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
    }
  },

  'crossed-off': {
    draw: ({ x, y, w, h }) => [line([x, y], [x + w, y + h]), line([x + w, y], [x, y + h])]
  },

  circle: {
    draw: (rect, { padding }) => {
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
    }
  },

  bracket: {
    draw: (rect, { padding, side }) => {
      const sides = Array.isArray(side) ? side : [side ?? 'right']
      const outer = padded(rect, padding)
      const arms: Record<Side, Point[]> = {
        top: [
          [outer.x, rect.y],
          [outer.x, outer.y],
          [outer.x + outer.w, outer.y],
          [outer.x + outer.w, rect.y]
        ],
        bottom: [
          [outer.x, rect.y + rect.h],
          [outer.x, outer.y + outer.h],
          [outer.x + outer.w, outer.y + outer.h],
          [outer.x + outer.w, rect.y + rect.h]
        ],
        left: [
          [rect.x, outer.y],
          [outer.x, outer.y],
          [outer.x, outer.y + outer.h],
          [rect.x, outer.y + outer.h]
        ],
        right: [
          [rect.x + rect.w, outer.y],
          [outer.x + outer.w, outer.y],
          [outer.x + outer.w, outer.y + outer.h],
          [rect.x + rect.w, outer.y + outer.h]
        ]
      }
      return sides.map((side) => ({ points: arms[side] }))
    }
  },

  arrow: {
    draw: (rect, { padding, side }) => {
      const from = (Array.isArray(side) ? side[0] : side) ?? 'left'
      const { x, y, w, h } = padded(rect, padding)
      const tips: Record<Side, { tip: Point; angle: number }> = {
        left: { tip: [x, y + h / 2], angle: 0 },
        right: { tip: [x + w, y + h / 2], angle: Math.PI },
        top: { tip: [x + w / 2, y], angle: Math.PI / 2 },
        bottom: { tip: [x + w / 2, y + h], angle: -Math.PI / 2 }
      }
      const { tip, angle } = tips[from]
      const length = Math.min(96, Math.max(48, rect.h * 1.6))
      const shaft: Point = [tip[0] - length * Math.cos(angle), tip[1] - length * Math.sin(angle)]
      const flick = Math.min(14, length * 0.4)
      return [
        line(shaft, tip),
        ...[0.5, -0.5].map((spread) => {
          const back = angle + Math.PI + spread
          return line(tip, [tip[0] + flick * Math.cos(back), tip[1] + flick * Math.sin(back)])
        })
      ]
    }
  }
}

function padded(rect: Rect, { top, right, bottom, left }: Required<Sides>): Rect {
  return {
    x: rect.x - left,
    y: rect.y - top,
    w: rect.w + left + right,
    h: rect.h + top + bottom
  }
}
