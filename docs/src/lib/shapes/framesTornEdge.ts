import type { Point, Rect, ShapeOptions, Spine } from '@shardsui/notation'

function framesTornEdge(rect: Rect, { padding }: ShapeOptions): Spine[] {
  const [top, right, bottom, left] = padding
  const x1 = rect.x - left
  const y1 = rect.y - top
  const x2 = rect.x + rect.w + right
  const y2 = rect.y + rect.h + bottom
  const h = y2 - y1
  const steps = Math.max(3, Math.min(9, Math.round(h / 9)))
  const tear = Math.max(2, Math.min(6, Math.min(h, x2 - x1) * 0.08))
  const points: Point[] = [
    [x1, y1],
    [x2, y1]
  ]
  for (let i = 1; i < steps; i++) {
    points.push([x2 + (i % 2 ? tear : -tear * 0.5), y1 + (h * i) / steps])
  }
  points.push([x2, y2], [x1, y2])
  for (let i = 1; i < steps; i++) {
    points.push([x1 - (i % 2 ? tear : -tear * 0.5), y2 - (h * i) / steps])
  }
  return [{ points, closed: true }]
}

export default framesTornEdge
