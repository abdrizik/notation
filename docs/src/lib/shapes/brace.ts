import type { Point, Rect, ShapeOptions, Spine } from '@shardsui/notation'

function brace(rect: Rect, { padding }: ShapeOptions): Spine[] {
  const x = rect.x - padding.left * 2
  const top = rect.y - padding.top
  const bottom = rect.y + rect.h + padding.bottom
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
  return [{ points: hook }]
}

export default brace
