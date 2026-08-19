import type { Rect, ShapeOptions, Spine } from '@shardsui/notation'

function caret(rect: Rect, { padding }: ShapeOptions): Spine[] {
  const x = rect.x + rect.w / 2
  const base = rect.y + rect.h + padding.bottom
  const arm = 9
  return [
    {
      points: [
        [x - arm, base + arm],
        [x, base],
        [x + arm, base + arm]
      ]
    },
    {
      points: [
        [x, base + arm * 0.4],
        [x, base + arm * 2]
      ]
    }
  ]
}

export default caret
