import type { Point, Rect, ShapeOptions } from '@shardsui/notation'

function curvedArrow(rect: Rect, { padding }: ShapeOptions): Point[][] {
  const tip: Point = [rect.x - padding[3], rect.y + rect.h / 2]
  const radius = 46
  const shaft: Point[] = []
  for (let i = 0; i <= 16; i++) {
    const a = Math.PI * (1 + (i / 16) * 0.5)
    shaft.push([tip[0] + radius * Math.cos(a), tip[1] + radius + radius * Math.sin(a)])
  }
  const flick = 13
  return [
    shaft,
    ...[0.6, -0.6].map((spread): Point[] => [
      tip,
      [tip[0] + flick * Math.cos(Math.PI + spread), tip[1] + flick * Math.sin(Math.PI + spread)]
    ])
  ]
}

export default curvedArrow
