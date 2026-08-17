export type AnnotationType =
  | 'underline'
  | 'box'
  | 'circle'
  | 'highlight'
  | 'strike-through'
  | 'crossed-off'
  | 'bracket'
  | 'arrow'

export type Side = 'left' | 'right' | 'top' | 'bottom'

export type Target = HTMLElement | string

export type Padding =
  | number
  | [number, number]
  | [number, number, number]
  | [number, number, number, number]

export interface Rect {
  x: number
  y: number
  w: number
  h: number
}

export type Point = [number, number]

export interface Spine {
  points: Point[]
  closed?: boolean
  overshoot?: boolean
  width?: number
}

export interface AnnotationOptions {
  type: AnnotationType | Shape
  color?: string
  strokeWidth?: number
  padding?: Padding
  iterations?: number
  wobble?: number
  rtl?: boolean
  multiline?: boolean
  duration?: number
  delay?: number
  easing?: string
  side?: Side | Side[]
  seed?: number
}

export interface ShapeOptions extends Omit<AnnotationOptions, 'padding'> {
  /** Always four numbers, however `padding` was written. */
  padding: [number, number, number, number]
}

export type Shape = (rect: Rect, options: ShapeOptions) => (Spine | Point[])[]

export interface Annotation {
  readonly showing: boolean
  /** Settles when the stroke in flight lands. */
  readonly finished: Promise<void>
  update(options: Partial<AnnotationOptions>): Annotation
  show(): Annotation
  hide(): Annotation
  remove(): void
}
