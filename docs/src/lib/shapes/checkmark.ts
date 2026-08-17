import type { Rect, ShapeOptions, Spine } from '@shardsui/notation'

function checkmark(rect: Rect, { padding }: ShapeOptions): Spine[] {
  const x = rect.x - padding[3] * 2
  const y = rect.y + rect.h / 2
  const arm = Math.min(13, rect.h)
  return [
    {
      points: [
        [x - arm * 1.7, y],
        [x - arm * 0.8, y + arm * 0.7],
        [x, y - arm]
      ],
      overshoot: true
    }
  ]
}

export default checkmark
