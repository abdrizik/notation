import type { Point, Rect, ShapeOptions, Spine } from '@shardsui/notation'

function scribbleOut(rect: Rect, { padding }: ShapeOptions): Spine[] {
  const top = rect.y - padding.top / 2
  const bottom = rect.y + rect.h + padding.bottom / 2
  const steps = Math.max(8, Math.round(rect.w / 13))
  const points: Point[] = []
  for (let i = 0; i <= steps; i++) {
    const x = rect.x + (rect.w * i) / steps
    points.push([x, i % 2 === 0 ? top : bottom])
  }
  return [{ points }]
}

export default scribbleOut
