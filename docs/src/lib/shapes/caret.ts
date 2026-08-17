import type { Point, Rect, ShapeOptions } from '@shardsui/notation'

function caret(rect: Rect, { padding }: ShapeOptions): Point[][] {
  const x = rect.x + rect.w / 2
  const base = rect.y + rect.h + padding[2]
  const arm = 9
  return [
    [
      [x - arm, base + arm],
      [x, base],
      [x + arm, base + arm]
    ],
    [
      [x, base + arm * 0.4],
      [x, base + arm * 2]
    ]
  ]
}

export default caret
