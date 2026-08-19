import type { Point, Rect, ShapeOptions, Spine } from '@shardsui/notation'

function pointersDoubleArrow(rect: Rect, { padding }: ShapeOptions): Spine[] {
  const y = rect.y + rect.h + padding.bottom
  const left = rect.x - padding.left * 0.4
  const right = rect.x + rect.w + padding.right * 0.4
  const barb = Math.max(5, Math.min(10, (right - left) * 0.09))
  const shaft: Point[] = [
    [left, y],
    [right, y]
  ]
  const leftHead: Point[] = [
    [left + barb, y - barb * 0.7],
    [left, y],
    [left + barb, y + barb * 0.7]
  ]
  const rightHead: Point[] = [
    [right - barb, y - barb * 0.7],
    [right, y],
    [right - barb, y + barb * 0.7]
  ]
  return [{ points: shaft }, { points: leftHead }, { points: rightHead }]
}

export default pointersDoubleArrow
