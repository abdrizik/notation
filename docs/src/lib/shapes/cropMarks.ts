import type { Point, Rect, ShapeOptions, Spine } from '@shardsui/notation'

function cropMarks(rect: Rect, { padding }: ShapeOptions): Spine[] {
  const [top, right, bottom, left] = padding
  const x1 = rect.x - left * 2
  const y1 = rect.y - top * 2
  const x2 = rect.x + rect.w + right * 2
  const y2 = rect.y + rect.h + bottom * 2
  const arm = 9
  const corners: Point[][] = [
    [
      [x1, y1 + arm],
      [x1, y1],
      [x1 + arm, y1]
    ],
    [
      [x2 - arm, y1],
      [x2, y1],
      [x2, y1 + arm]
    ],
    [
      [x2, y2 - arm],
      [x2, y2],
      [x2 - arm, y2]
    ],
    [
      [x1 + arm, y2],
      [x1, y2],
      [x1, y2 - arm]
    ]
  ]
  return corners.map((points) => ({ points, overshoot: true }))
}

export default cropMarks
