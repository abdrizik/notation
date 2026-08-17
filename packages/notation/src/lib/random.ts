function hash(seed: number, i: number): number {
  let h = Math.imul(i ^ seed, 0x9e3779b1)
  h ^= h >>> 15
  h = Math.imul(h, 0x85ebca77)
  h ^= h >>> 13
  return (h >>> 0) / 0xffffffff
}

/** Smoothed noise: the hash sampled at whole steps, interpolated in between. */
export function noise(seed: number, t: number): number {
  const i = Math.floor(t)
  const f = t - i
  const ease = f * f * (3 - 2 * f)
  const a = hash(seed, i) * 2 - 1
  const b = hash(seed, i + 1) * 2 - 1
  return a + (b - a) * ease
}

/** Offset from the noise field, so a stroke's pressure is not tied to its opening drift. */
export function random(seed: number): () => number {
  let i = 0
  return () => hash(seed ^ 0x5f, i++)
}
