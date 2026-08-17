import type { Annotation, AnnotationOptions, Rect } from './types.ts'
import { resolve, type ResolvedOptions } from './options.ts'
import { isMarker, toShape, toStrokes, type Stroke } from './shapes.ts'
import { animate } from './timeline.ts'
import { watch } from './watch.ts'

const SVG_NS = 'http://www.w3.org/2000/svg'

type Intent = 'shown' | 'hidden' | 'removed'

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

function toPath(stroke: Stroke): SVGPathElement {
  const path = document.createElementNS(SVG_NS, 'path')
  path.setAttribute('d', stroke.d)
  path.setAttribute(
    'style',
    `fill:none;stroke:currentColor;stroke-linejoin:round;stroke-width:${stroke.width};stroke-linecap:${stroke.cap};stroke-opacity:${stroke.opacity}`
  )
  return path
}

function lift(element: HTMLElement): () => void {
  const computed = getComputedStyle(element)
  const { position, zIndex } = element.style
  const lifted = computed.position === 'static'
  const raised = computed.zIndex === 'auto'
  if (lifted) element.style.position = 'relative'
  if (raised) element.style.zIndex = '1'
  return () => {
    if (lifted && element.style.position === 'relative') element.style.position = position
    if (raised && element.style.zIndex === '1') element.style.zIndex = zIndex
  }
}

function defined(options: Partial<AnnotationOptions>): Partial<AnnotationOptions> {
  return Object.fromEntries(Object.entries(options).filter(([, value]) => value !== undefined))
}

function snapshot(rects: Rect[]): string {
  return rects
    .map((r) => `${Math.round(r.x)},${Math.round(r.y)},${Math.round(r.w)},${Math.round(r.h)}`)
    .join(';')
}

async function landed(running: Animation[]): Promise<void> {
  await Promise.allSettled(running.map((animation) => animation.finished))
}

export function createAnnotation(element: HTMLElement, options: AnnotationOptions): Annotation {
  const raw = { ...options }
  let config: ResolvedOptions = resolve(raw)
  raw.seed = config.seed
  toShape(config.type)

  let canvas: SVGSVGElement | undefined
  let drop: (() => void) | undefined
  let lastSnapshot = ''
  let intent: Intent = 'hidden'
  let finished = Promise.resolve()

  function animations(): Animation[] {
    return canvas?.getAnimations({ subtree: true }) ?? []
  }

  const inked = () => animations().length > 0
  const retracting = () => animations().some((animation) => animation.playbackRate < 0)

  function attach(): void {
    if (canvas || !element.parentElement) return
    canvas = createCanvas()
    element.insertAdjacentElement('afterend', canvas)
    restack()
  }

  function detach(): void {
    clear()
    canvas?.remove()
    canvas = undefined
    drop?.()
    drop = undefined
  }

  function restack(): void {
    if (isMarker(config.type)) drop ??= lift(element)
    else {
      drop?.()
      drop = undefined
    }
  }

  function clear(): void {
    for (const animation of animations()) animation.cancel()
    canvas?.replaceChildren()
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

  function remeasure(): (() => Promise<void>) | undefined {
    if (!element.isConnected) {
      detach()
      return undefined
    }
    if (intent !== 'shown') return undefined

    attach()
    const rects = measure()
    if (rects.length === 0) return undefined
    if (inked() && snapshot(rects) === lastSnapshot) return undefined
    return () => render(rects)
  }

  function resumePoint(): number | undefined {
    const [first] = animations()
    if (!first) return undefined
    if (retracting()) return 1
    return Number(first.effect?.getComputedTiming().progress ?? 1)
  }

  function seek(animation: Animation, fraction: number): void {
    const { delay = 0, duration = 0 } = animation.effect?.getTiming() ?? {}
    animation.currentTime = Number(delay) + fraction * Number(duration)
  }

  async function render(rects = measure()): Promise<void> {
    if (!canvas || rects.length === 0) return

    const resumeAt = resumePoint()
    clear()
    canvas.style.color = config.color

    const batch = document.createDocumentFragment()
    const strokes = toStrokes(rects, config).map((stroke) => {
      const path = toPath(stroke)
      batch.append(path)
      return { path, length: stroke.length, lift: stroke.lift }
    })
    canvas.append(batch)

    const running = animate(strokes, config)
    if (resumeAt !== undefined) {
      for (const animation of running) {
        if (resumeAt < 1) seek(animation, resumeAt)
        else animation.finish()
      }
    }

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

    update(next) {
      if (next.type) toShape(next.type)
      config = resolve(Object.assign(raw, defined(next)))
      if (canvas) restack()
      if (inked() && !retracting()) finished = render()
      return annotation
    },

    show() {
      if (intent === 'removed') return annotation
      intent = 'shown'
      attach()
      finished = retracting() ? landed(play(1)) : render()
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
