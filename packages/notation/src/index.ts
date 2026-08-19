import type {
  Annotation,
  AnnotationOptions,
  Rect,
  ResolvedOptions,
  ShapeEntry,
  Sides,
  Stroke,
  Target
} from './types'
import { createHand, random } from './hand'
import { MARKER, PEN, SHAPES } from './shapes'

export type {
  Annotation,
  AnnotationOptions,
  AnnotationType,
  Point,
  Rect,
  Shape,
  ShapeOptions,
  Side,
  Sides,
  Spine,
  Target
} from './types'

type Entry = [Target, AnnotationOptions]

export function annotate(target: Target, options: AnnotationOptions): Annotation
export function annotate(entries: Entry[]): Annotation
export function annotate(target: Target | Entry[], options?: AnnotationOptions): Annotation {
  const entries =
    Array.isArray(target) && Array.isArray(target[0])
      ? (target as Entry[])
      : [[target as Target, options!] satisfies Entry]
  const annotations = entries.flatMap(([target, options]) =>
    findElements(target).map((element) => createAnnotation(element, options))
  )
  return annotations.length === 1 ? annotations[0] : group(...annotations)
}

function findElements(target: Target): HTMLElement[] {
  if (Array.isArray(target)) return target.flatMap(findElements)
  if (typeof target !== 'string') return [target]
  const found = document.querySelectorAll<HTMLElement>(target)
  if (found.length === 0) console.warn(`notation: no element matches "${target}"`)
  return [...found]
}

const PEN_EASING =
  'linear(0, 0.11 12%, 0.28 26%, 0.44 40%, 0.48 46%, 0.7 64%, 0.86 78%, 0.96 90%, 1)'

function resolve(options: AnnotationOptions & { seed: number }): ResolvedOptions {
  const entry: ShapeEntry | undefined =
    typeof options.type === 'function' ? { draw: options.type } : SHAPES[options.type]
  if (!entry) throw new Error(`notation: unknown type "${options.type}"`)
  return {
    ...options,
    draw: entry.draw,
    tool: entry.tool ?? PEN,
    color: options.color ?? 'currentColor',
    strokeWidth: options.strokeWidth ?? 1.5,
    padding: toSides(options.padding),
    iterations: Math.max(1, Math.round(options.iterations ?? 1)),
    wobble: options.wobble ?? 1,
    multiline: options.multiline ?? entry.perLine ?? false,
    duration: Math.max(0, options.duration ?? 800),
    delay: Math.max(0, options.delay ?? 0),
    ease: options.ease ?? PEN_EASING
  }
}

function toSides(padding: number | Sides = 5): Required<Sides> {
  if (typeof padding === 'number')
    return { top: padding, right: padding, bottom: padding, left: padding }
  return { top: 5, right: 5, bottom: 5, left: 5, ...padding }
}

const SVG_NS = 'http://www.w3.org/2000/svg'

function createCanvas(): SVGSVGElement {
  const canvas = document.createElementNS(SVG_NS, 'svg')
  canvas.setAttribute('class', 'notation')
  canvas.setAttribute('aria-hidden', 'true')
  canvas.setAttribute(
    'style',
    'position:absolute;width:1px;height:1px;overflow:visible;pointer-events:none'
  )
  return canvas
}

function toPathElement(stroke: Stroke): SVGPathElement {
  const path = document.createElementNS(SVG_NS, 'path')
  path.setAttribute('d', stroke.d)
  path.setAttribute('pathLength', '1')
  path.setAttribute(
    'style',
    `fill:none;stroke:currentColor;stroke-linejoin:round;stroke-width:${stroke.width};stroke-linecap:${stroke.cap};stroke-opacity:${stroke.opacity};stroke-dasharray:1 2`
  )
  return path
}

function raise(element: HTMLElement): () => void {
  const computed = getComputedStyle(element)
  const { position, zIndex } = element.style
  const wasStatic = computed.position === 'static'
  const wasAuto = computed.zIndex === 'auto'
  if (wasStatic) element.style.position = 'relative'
  if (wasAuto) element.style.zIndex = '1'
  return () => {
    if (wasStatic && element.style.position === 'relative') element.style.position = position
    if (wasAuto && element.style.zIndex === '1') element.style.zIndex = zIndex
  }
}

function watch(element: Element, remeasure: () => void): () => void {
  let frame: number | undefined
  const observer = new ResizeObserver(() => {
    frame ??= requestAnimationFrame(() => {
      frame = undefined
      remeasure()
    })
  })
  observer.observe(element)
  observer.observe(document.documentElement)
  return () => {
    if (frame !== undefined) cancelAnimationFrame(frame)
    observer.disconnect()
  }
}

function snapshot(rects: Rect[]): string {
  return rects
    .map((r) => `${Math.round(r.x)},${Math.round(r.y)},${Math.round(r.w)},${Math.round(r.h)}`)
    .join(';')
}

function createAnnotation(element: HTMLElement, options: AnnotationOptions): Annotation {
  const config = resolve({ ...options, seed: (Math.random() * 2 ** 32) >>> 0 })

  let canvas: SVGSVGElement | undefined
  let drop: (() => void) | undefined
  let lastSnapshot = ''
  let intent: 'shown' | 'hidden' | 'removed' = 'hidden'
  let finished = Promise.resolve()

  function animations(): Animation[] {
    return canvas?.getAnimations({ subtree: true }) ?? []
  }

  const inked = () => animations().length > 0

  function attach(): void {
    if (canvas || !element.parentElement) return
    canvas = createCanvas()
    element.insertAdjacentElement('afterend', canvas)
    if (config.tool === MARKER) drop ??= raise(element)
  }

  function detach(): void {
    clear()
    canvas?.remove()
    canvas = undefined
    drop?.()
    drop = undefined
  }

  function clear(): void {
    for (const animation of animations()) animation.cancel()
    canvas?.replaceChildren()
    lastSnapshot = ''
  }

  function measure(): Rect[] {
    const toLocal = canvas?.getScreenCTM()?.inverse()
    if (!toLocal) return []
    return Array.from(element.getClientRects(), (box) => {
      const from = new DOMPoint(box.left, box.top).matrixTransform(toLocal)
      const to = new DOMPoint(box.right, box.bottom).matrixTransform(toLocal)
      return { x: from.x, y: from.y, w: to.x - from.x, h: to.y - from.y }
    })
  }

  function remeasure(): void {
    if (!element.isConnected) return detach()
    if (intent !== 'shown') return
    attach()
    const rects = measure()
    if (rects.length === 0) return
    if (snapshot(rects) === lastSnapshot) return
    void render(rects)
  }

  function resumePoint(): number | undefined {
    const [first] = animations()
    return first ? (first.effect?.getComputedTiming().progress ?? 1) : undefined
  }

  async function render(rects = measure()): Promise<void> {
    if (!canvas || rects.length === 0) return

    const resumeAt = resumePoint()
    clear()
    canvas.style.color = config.color

    const strokes = toStrokes(rects, config).map((stroke) => ({
      path: toPathElement(stroke),
      length: stroke.length,
      lift: stroke.lift
    }))
    canvas.append(...strokes.map((stroke) => stroke.path))

    const running = animate(strokes, config, resumeAt)
    lastSnapshot = snapshot(rects)
    await landed(running)
  }

  function play(rate: number): Animation[] {
    const running = animations()
    for (const animation of running) {
      animation.playbackRate = rate
      animation.play()
    }
    return running
  }

  async function retract(): Promise<void> {
    await landed(play(-1))
    if (intent === 'hidden') clear()
  }

  const unwatch = watch(element, remeasure)

  const annotation: Annotation = {
    get showing() {
      return inked()
    },

    get finished() {
      return finished
    },

    show() {
      if (intent === 'removed') return annotation
      const retracting = intent === 'hidden' && inked()
      intent = 'shown'
      attach()
      finished = retracting ? landed(play(1)) : render()
      return annotation
    },

    hide() {
      if (intent !== 'shown') return annotation
      intent = 'hidden'
      finished = retract()
      return annotation
    },

    remove() {
      intent = 'removed'
      finished = Promise.resolve()
      unwatch()
      detach()
    }
  }

  return annotation
}

function group(...annotations: Annotation[]): Annotation {
  let sequence = 0
  let finished = Promise.resolve()

  async function drawInTurn(): Promise<void> {
    const current = ++sequence
    for (const annotation of annotations) {
      if (current !== sequence) return
      await annotation.show().finished
    }
  }

  async function retractTogether(): Promise<void> {
    await Promise.all(annotations.map((annotation) => annotation.hide().finished))
  }

  const grouped: Annotation = {
    get showing() {
      return annotations.some((annotation) => annotation.showing)
    },

    get finished() {
      return finished
    },

    show() {
      finished = drawInTurn()
      return grouped
    },

    hide() {
      sequence++
      finished = retractTogether()
      return grouped
    },

    remove() {
      sequence++
      finished = Promise.resolve()
      for (const annotation of annotations) annotation.remove()
    }
  }

  return grouped
}

const reducedMotion = globalThis.matchMedia?.('(prefers-reduced-motion: reduce)')

function animate(
  strokes: { path: SVGPathElement; length: number; lift: number }[],
  options: ResolvedOptions,
  resumeAt?: number
): Animation[] {
  const still = reducedMotion?.matches
  const total = Math.max(1, still ? 0 : options.duration)
  const delay = still ? 0 : options.delay

  const rhythm = random(options.seed)
  let cursor = 0
  const windows = strokes.map(({ path, length, lift }) => {
    const from = cursor + lift / 3
    cursor = from + length * (0.92 + rhythm() * 0.16)
    return { path, from, to: cursor }
  })

  function offset(time: number): number {
    return Math.min(1, time / cursor)
  }

  return windows.map(({ path, from, to }) => {
    const animation = path.animate(
      [
        { strokeDashoffset: 1, offset: 0 },
        { strokeDashoffset: 1, offset: offset(from), easing: options.ease },
        { strokeDashoffset: 0, offset: offset(to) },
        { strokeDashoffset: 0, offset: 1 }
      ],
      { duration: total, delay, fill: 'both' }
    )
    if (resumeAt !== undefined) animation.currentTime = delay + resumeAt * total
    return animation
  })
}

async function landed(running: Animation[]): Promise<void> {
  await Promise.allSettled(running.map((animation) => animation.finished))
}

function union(rects: Rect[]): Rect {
  const left = Math.min(...rects.map((r) => r.x))
  const top = Math.min(...rects.map((r) => r.y))
  const right = Math.max(...rects.map((r) => r.x + r.w))
  const bottom = Math.max(...rects.map((r) => r.y + r.h))
  return { x: left, y: top, w: right - left, h: bottom - top }
}

function toStrokes(rects: Rect[], options: ResolvedOptions): Stroke[] {
  const spines = (options.multiline ? rects : [union(rects)])
    .flatMap((rect) => options.draw(rect, options))
    .filter((spine) => spine.points.length >= 2)

  const tool = options.tool
  const hand = createHand(options.seed, options.wobble * tool.wobble)

  const strokes: Stroke[] = []
  for (let pass = 0; pass < options.iterations; pass++) {
    const forward = pass % 2 === 0
    for (const spine of spines) {
      const points = forward ? spine.points : spine.points.toReversed()
      const { pressure, ...drawn } = hand({ ...spine, points })
      strokes.push({
        ...drawn,
        width: spine.width ?? options.strokeWidth * pressure,
        opacity: (pass === 0 ? 1 : 0.75) * tool.opacity,
        cap: tool.cap
      })
    }
  }
  return strokes
}
