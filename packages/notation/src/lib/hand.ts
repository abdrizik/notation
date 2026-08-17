import type { Point, Spine } from './types.ts'
import { noise, random } from './random.ts'

export interface Trace {
  d: string
  length: number
  lift: number
  pressure: number
}

const DRIFT = 3
const DRIFT_WAVE = 260
const TREMOR = 0.8
const TREMOR_WAVE = 32
const BOW = 4
const SAMPLE = 12
const MAX_POINTS = 200

function dist([ax, ay]: Point, [bx, by]: Point): number {
  return Math.hypot(bx - ax, by - ay)
}

function round(n: number): number {
  return Math.round(n * 100) / 100
}

/** Catmull-Rom through every point, emitted as the cubic segments SVG understands. */
function toPath(points: Point[]): string {
  const p = [points[0], ...points, points.at(-1)!]
  let d = `M${round(p[1][0])} ${round(p[1][1])}`
  for (let i = 1; i + 2 < p.length; i++) {
    const [x0, y0] = p[i - 1]
    const [x1, y1] = p[i]
    const [x2, y2] = p[i + 1]
    const [x3, y3] = p[i + 2]
    const rest = `${round(x2 + (x1 - x3) / 6)} ${round(y2 + (y1 - y3) / 6)}, ${round(x2)} ${round(y2)}`
    d +=
      i === 1 ? `C${round(x1 + (x2 - x0) / 6)} ${round(y1 + (y2 - y0) / 6)}, ${rest}` : `S${rest}`
  }
  return d
}

/** Even spacing, so the wobble below reads the same on a short word and a long paragraph. */
function resample(spine: Point[], spacing: number): Point[] {
  let length = 0
  for (let i = 1; i < spine.length; i++) {
    length += dist(spine[i - 1], spine[i])
  }
  if (length === 0) return [spine[0], spine.at(-1)!]

  const segments = Math.max(2, Math.min(MAX_POINTS, Math.round(length / spacing)))
  const step = length / segments

  const points: Point[] = [spine[0]]
  let due = step
  let walked = 0
  for (let i = 1; i < spine.length; i++) {
    const [ax, ay] = spine[i - 1]
    const [bx, by] = spine[i]
    const run = dist(spine[i - 1], spine[i])
    if (run === 0) continue
    while (walked + run >= due && points.length < segments) {
      const t = (due - walked) / run
      points.push([ax + (bx - ax) * t, ay + (by - ay) * t])
      due += step
    }
    walked += run
  }
  points.push(spine.at(-1)!)
  return points
}

export function createHand(seed: number, wobble: number) {
  const rng = random(seed)
  let travel = 0
  let pen: Point | undefined

  function overshootPast(spine: Point[]): Point[] {
    const [ax, ay] = spine.at(-2)!
    const [bx, by] = spine.at(-1)!
    const run = dist([ax, ay], [bx, by]) || 1
    const past = Math.min((1.5 + rng() * 2) * Math.min(1.5, wobble), run * 0.25)
    return [...spine.slice(0, -1), [bx + ((bx - ax) / run) * past, by + ((by - ay) / run) * past]]
  }

  function sway(points: Point[], length: number): Point[] {
    const drift = DRIFT * Math.min(1, length / 120)
    const tremor = TREMOR * Math.min(1, length / 20)
    // a single arc across the stroke: short strokes are too short to catch a drift wave,
    // and without it they come out tilted rather than drawn
    const bow = (rng() * 2 - 1) * BOW * Math.min(1, length / 300)
    const last = points.length - 1
    const ends = Math.max(1, Math.min(2, last / 2))

    return points.map((p, i): Point => {
      const at = travel + i * SAMPLE
      const along = last === 0 ? 0 : i / last
      // pinned ends, so the strokes of a shape still meet where the shape says they do
      const grip = Math.min(1, i / ends, (last - i) / ends)
      const offset =
        wobble *
        grip *
        (drift * noise(seed, at / DRIFT_WAVE) +
          tremor * noise(~seed, at / TREMOR_WAVE) +
          bow * Math.sin(Math.PI * along))
      const prev = points[Math.max(0, i - 1)]
      const next = points[Math.min(last, i + 1)]
      const run = dist(prev, next) || 1
      return [
        p[0] + ((prev[1] - next[1]) / run) * offset,
        p[1] + ((next[0] - prev[0]) / run) * offset
      ]
    })
  }

  function loop(spine: Point[]): Point[] {
    const ring = resample([...spine, spine[0]], SAMPLE)
    ring.pop()
    const start = Math.floor(rng() * ring.length)
    const turned = [...ring.slice(start), ...ring.slice(0, start)]

    const cx = ring.reduce((sum, [x]) => sum + x, 0) / ring.length
    const cy = ring.reduce((sum, [, y]) => sum + y, 0) / ring.length
    const past = 1 + Math.round(rng() * 2)
    const tuck = 0.04 * Math.min(1, wobble)
    const tail = turned.slice(0, past + 1).map(([x, y], i): Point => {
      const inward = tuck * (i / past)
      return [x + (cx - x) * inward, y + (cy - y) * inward]
    })
    return [...turned, ...tail]
  }

  return function stroke({ points: spine, overshoot, closed }: Spine): Trace {
    const path = overshoot ? overshootPast(spine) : spine
    const points = closed ? loop(path) : resample(path, SAMPLE)
    const length = (points.length - 1) * SAMPLE

    const lift = pen ? dist(pen, points[0]) : 0
    travel += lift

    const swayed = sway(points, length)

    pen = points.at(-1)!
    travel += length
    return { d: toPath(swayed), length, lift, pressure: 0.85 + rng() * 0.3 }
  }
}
