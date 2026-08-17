import type { ResolvedOptions } from './options.ts'
import { random } from './random.ts'

const reducedMotion = globalThis.matchMedia?.('(prefers-reduced-motion: reduce)')

export function animate(
  strokes: { path: SVGPathElement; length: number; lift: number }[],
  options: ResolvedOptions
): Animation[] {
  const still = reducedMotion?.matches ?? false
  const total = Math.max(1, still ? 0 : options.duration)
  // a start offset, not dead air inside the animation
  const delay = still ? 0 : options.delay

  const rhythm = random(options.seed)
  let cursor = 0
  const windows = strokes.map(({ path, length, lift }) => {
    // the reveal: a unit-length dash slid off the path, drawn back on by animating its offset
    path.setAttribute('pathLength', '1')
    path.style.strokeDasharray = '1 2'
    const from = cursor + lift / 3
    cursor = from + length * (0.92 + rhythm() * 0.16)
    return { path, from, to: cursor }
  })

  function offset(time: number): number {
    return Math.min(1, time / (cursor || 1))
  }

  return windows.map(({ path, from, to }) =>
    path.animate(
      [
        { strokeDashoffset: 1, offset: 0 },
        { strokeDashoffset: 1, offset: offset(from), easing: options.easing },
        { strokeDashoffset: 0, offset: offset(to) },
        { strokeDashoffset: 0, offset: 1 }
      ],
      { duration: total, delay, fill: 'both' }
    )
  )
}
