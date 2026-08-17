import type { Point, Rect, ShapeOptions } from '@shardsui/notation'

function star(rect: Rect, { padding }: ShapeOptions): Point[][] {
  const x = rect.x + rect.w + padding[1] * 2 + 11
  const y = rect.y + rect.h / 2
  const radius = 11
  const points: Point[] = []
  for (let i = 0; i <= 5; i++) {
    const angle = (i / 5) * Math.PI * 4 - Math.PI / 2
    points.push([x + radius * Math.cos(angle), y + radius * Math.sin(angle)])
  }
  return [points]
}

export default star
