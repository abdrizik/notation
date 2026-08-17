import type { Point, Rect, ShapeOptions } from '@shardsui/notation'

function brace(rect: Rect, { padding }: ShapeOptions): Point[][] {
  const x = rect.x - padding[3] * 2
  const top = rect.y - padding[0]
  const bottom = rect.y + rect.h + padding[2]
  const mid = (top + bottom) / 2
  const arm = 9
  const hook: Point[] = [
    [x + arm, top],
    [x + arm * 0.3, top + arm],
    [x + arm * 0.3, mid - arm],
    [x - arm * 0.6, mid],
    [x + arm * 0.3, mid + arm],
    [x + arm * 0.3, bottom - arm],
    [x + arm, bottom]
  ]
  return [hook]
}

export default brace
