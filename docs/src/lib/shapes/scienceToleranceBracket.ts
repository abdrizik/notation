import type { Point, Rect, ShapeOptions, Spine } from '@shardsui/notation'

function scienceToleranceBracket(rect: Rect, { padding }: ShapeOptions): Spine[] {
  const x = rect.x + rect.w + padding.right
  const top = rect.y - padding.top
  const bottom = rect.y + rect.h + padding.bottom
  const mid = (top + bottom) * 0.5
  const lip = Math.max(3, Math.min(8, rect.w * 0.06))
  const arm = Math.max(4, Math.min(9, rect.h * 0.3))
  const gap = Math.max(4, Math.min(10, rect.h * 0.34))
  const spine: Point[] = [
    [x - lip, top],
    [x, top + lip],
    [x, mid],
    [x, bottom - lip],
    [x - lip, bottom]
  ]
  const plusX = x + gap + arm * 0.5
  const plusY = mid - arm * 0.9
  const plusH: Point[] = [
    [plusX - arm * 0.5, plusY],
    [plusX + arm * 0.5, plusY]
  ]
  const plusV: Point[] = [
    [plusX, plusY - arm * 0.5],
    [plusX, plusY + arm * 0.5]
  ]
  const minus: Point[] = [
    [plusX - arm * 0.5, mid + arm * 0.9],
    [plusX + arm * 0.5, mid + arm * 0.9]
  ]
  return [{ points: spine }, { points: plusH }, { points: plusV }, { points: minus }]
}

export default scienceToleranceBracket
