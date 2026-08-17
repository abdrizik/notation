import type { Point, Rect, ShapeOptions, Spine } from '@shardsui/notation'

function numberBadge(rect: Rect, { padding }: ShapeOptions): Spine[] {
  const x = rect.x - padding[3] * 2 - 13
  const y = rect.y + rect.h / 2
  const radius = 12
  const ring: Point[] = []
  for (let i = 0; i < 22; i++) {
    const angle = (i / 22) * Math.PI * 2
    ring.push([x + radius * Math.cos(angle), y + radius * Math.sin(angle)])
  }
  return [
    { points: ring, closed: true },
    {
      points: [
        [x - 4, y - 3],
        [x, y - 7],
        [x, y + 6]
      ]
    }
  ]
}

export default numberBadge
