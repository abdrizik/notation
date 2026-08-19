import type { Point, Rect, ShapeOptions, Spine } from '@shardsui/notation'

function circleSlash(rect: Rect, { padding }: ShapeOptions): Spine[] {
  const cx = rect.x + rect.w / 2
  const cy = rect.y + rect.h / 2
  const rx = rect.w / 2 + padding.right * 2
  const ry = rect.h / 2 + padding.top * 2
  const ring: Point[] = []
  for (let i = 0; i < 28; i++) {
    const a = (i / 28) * Math.PI * 2
    ring.push([cx + rx * Math.cos(a), cy + ry * Math.sin(a)])
  }
  return [
    { points: ring, closed: true },
    {
      points: [
        [cx - rx * 0.72, cy + ry * 0.72],
        [cx + rx * 0.72, cy - ry * 0.72]
      ]
    }
  ]
}

export default circleSlash
