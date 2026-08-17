import type { Point, Rect, ShapeOptions } from '@shardsui/notation'

function squiggle(rect: Rect, { padding }: ShapeOptions): Point[][] {
  const y = rect.y + rect.h + padding[2]
  const waves = Math.round(rect.w / 26)
  const points: Point[] = []
  for (let i = 0; i <= waves * 8; i++) {
    const t = i / (waves * 8)
    points.push([rect.x + rect.w * t, y + Math.sin(t * waves * Math.PI * 2) * 3])
  }
  return [points]
}

export default squiggle
