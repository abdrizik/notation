import type { Point, Rect, ShapeOptions, Spine } from '@shardsui/notation'

function whiteboardStarCallout(rect: Rect, { padding }: ShapeOptions): Spine[] {
  const { top, right } = padding
  const r = Math.max(9, Math.min(22, rect.h * 0.75))
  const cx = rect.x + rect.w + right + r * 1.1
  const cy = rect.y + rect.h / 2 - top * 0.2
  const star: Point[] = []
  for (let i = 0; i < 5; i++) {
    const a = ((i * 2) % 5) * ((Math.PI * 2) / 5) - Math.PI / 2
    star.push([cx + r * Math.cos(a), cy + r * Math.sin(a)])
  }
  const lead: Point[] = [
    [rect.x + rect.w + right * 0.4, rect.y + rect.h / 2],
    [cx - r * 0.95, cy]
  ]
  return [{ points: lead }, { points: star, closed: true }]
}

export default whiteboardStarCallout
