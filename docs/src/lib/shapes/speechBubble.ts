import type { Point, Rect, ShapeOptions, Spine } from '@shardsui/notation'

function speechBubble(rect: Rect, { padding }: ShapeOptions): Spine[] {
  const { top, right, bottom, left } = padding
  const x = rect.x - left * 2
  const y = rect.y - top * 2
  const w = rect.w + (left + right) * 2
  const h = rect.h + (top + bottom) * 2
  const cx = x + w / 2
  const cy = y + h / 2
  const ring: Point[] = []
  for (let i = 0; i < 26; i++) {
    const angle = (i / 26) * Math.PI * 2
    ring.push([cx + (w / 2) * Math.cos(angle), cy + (h / 2) * Math.sin(angle)])
  }
  return [
    { points: ring, closed: true },
    {
      points: [
        [cx - w * 0.16, y + h],
        [cx - w * 0.22, y + h + 13],
        [cx - w * 0.04, y + h - 2]
      ]
    }
  ]
}

export default speechBubble
