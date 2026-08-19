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

export type Target = HTMLElement | string | (HTMLElement | string)[]

export type Sides = {
  top?: number
  right?: number
  bottom?: number
  left?: number
}

export type Rect = {
  x: number
  y: number
  w: number
  h: number
}

export type Point = [number, number]

export type Spine = {
  points: Point[]
  closed?: boolean
  overshoot?: boolean
  width?: number
}

export type AnnotationOptions = {
  type: AnnotationType | Shape
  color?: string
  strokeWidth?: number
  padding?: number | Sides
  iterations?: number
  wobble?: number
  multiline?: boolean
  duration?: number
  delay?: number
  ease?: string
  side?: Side | Side[]
}

export type ShapeOptions = Omit<AnnotationOptions, 'padding'> & {
  padding: Required<Sides>
}

export type Shape = (rect: Rect, options: ShapeOptions) => Spine[]

export type Annotation = {
  readonly showing: boolean
  readonly finished: Promise<void>
  show(): Annotation
  hide(): Annotation
  remove(): void
}

export type Tool = {
  wobble: number
  opacity: number
  cap: 'round' | 'butt'
}

export type ShapeEntry = {
  draw: Shape
  tool?: Tool
  perLine?: boolean
}

export type ResolvedOptions = ShapeOptions &
  Required<Omit<AnnotationOptions, 'type' | 'padding' | 'side'>> & {
    draw: Shape
    tool: Tool
    seed: number
  }

export type Stroke = {
  d: string
  length: number
  lift: number
  width: number
  opacity: number
  cap: Tool['cap']
}
