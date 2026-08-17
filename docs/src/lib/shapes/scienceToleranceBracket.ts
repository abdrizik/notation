import type { Point, Rect, ShapeOptions } from '@shardsui/notation'

function scienceToleranceBracket(rect: Rect, { padding }: ShapeOptions): Point[][] {
  const x = rect.x + rect.w + padding[1]
  const top = rect.y - padding[0]
  const bottom = rect.y + rect.h + padding[2]
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
  return [spine, plusH, plusV, minus]
}

export default scienceToleranceBracket
