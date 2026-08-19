import type { Point, Rect, ShapeOptions, Spine } from '@shardsui/notation'

function deletionHatch(rect: Rect, { padding }: ShapeOptions): Spine[] {
  const left = rect.x - padding.left
  const right = rect.x + rect.w + padding.right
  const top = rect.y - padding.top
  const bottom = rect.y + rect.h + padding.bottom
  const height = bottom - top
  const gap = Math.max(7, Math.min(16, height / 2.2))
  const spines: Spine[] = []
  for (let x0 = left - height; x0 < right; x0 += gap) {
    const tStart = Math.max(0, (left - x0) / height)
    const tEnd = Math.min(1, (right - x0) / height)
    if (tEnd - tStart < 0.12) continue
    const points: Point[] = [
      [x0 + tStart * height, bottom - tStart * height],
      [x0 + tEnd * height, bottom - tEnd * height]
    ]
    spines.push({ points, overshoot: true })
  }
  return spines
}

export default deletionHatch
