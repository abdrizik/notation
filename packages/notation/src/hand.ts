import type { Point, Spine } from './types'

const DRIFT = 2.25
const DRIFT_WAVE = 260
const TREMOR = 0.6
const TREMOR_WAVE = 32
const BOW = 3
const SAMPLE = 12
const MAX_POINTS = 200

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
    const bow = (rng() * 2 - 1) * BOW * Math.min(1, length / 300)
    const last = points.length - 1
    const ends = Math.max(1, Math.min(2, last / 2))

    return points.map((p, i): Point => {
      const at = travel + i * SAMPLE
      const along = i / last
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

  return function hand({ points: spine, overshoot, closed }: Spine) {
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

function resample(spine: Point[], spacing: number): Point[] {
  const runs: number[] = []
  let length = 0
  for (let i = 1; i < spine.length; i++) {
    runs.push(dist(spine[i - 1], spine[i]))
    length += runs[i - 1]
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
    const run = runs[i - 1]
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

function dist([ax, ay]: Point, [bx, by]: Point): number {
  return Math.hypot(bx - ax, by - ay)
}

function round(n: number): number {
  return Math.round(n * 100) / 100
}

function hash(seed: number, i: number): number {
  let h = Math.imul(i ^ seed, 0x9e3779b1)
  h ^= h >>> 15
  h = Math.imul(h, 0x85ebca77)
  h ^= h >>> 13
  return (h >>> 0) / 0xffffffff
}

function noise(seed: number, t: number): number {
  const i = Math.floor(t)
  const f = t - i
  const ease = f * f * (3 - 2 * f)
  const a = hash(seed, i) * 2 - 1
  const b = hash(seed, i + 1) * 2 - 1
  return a + (b - a) * ease
}

export function random(seed: number): () => number {
  let i = 0
  return () => hash(seed ^ 0x5f, i++)
}
