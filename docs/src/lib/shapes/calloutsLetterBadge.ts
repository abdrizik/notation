import type { Point, Rect, ShapeOptions, Spine } from '@shardsui/notation'

function calloutsLetterBadge(rect: Rect, { padding }: ShapeOptions): Spine[] {
  const radius = 13
  const cx = rect.x - padding[3] - radius - 4
  const cy = rect.y + rect.h / 2
  const hex: Point[] = []
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2 - Math.PI / 2
    hex.push([cx + radius * Math.cos(angle), cy + radius * Math.sin(angle)])
  }
  return [
    { points: hex, closed: true },
    {
      points: [
        [cx - 4.5, cy + 5.5],
        [cx, cy - 6.5],
        [cx + 4.5, cy + 5.5]
      ]
    },
    {
      points: [
        [cx - 2.6, cy + 0.5],
        [cx + 2.6, cy + 0.5]
      ],
      width: 1.5
    }
  ]
}

export default calloutsLetterBadge
