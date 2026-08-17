# notation

hand-drawn :annotate[annotations] for the web

Underlines, boxes, circles, highlights, strike-throughs, cross-offs, brackets and arrows, or a shape you write yourself. Each
one is an animated SVG stroke over any element, re-measured when the text reflows. It takes a DOM
element rather than a component, so it works in any framework, or none. Zero dependencies.

## Installation

```bash
npm install @shardsui/notation
```

Coding agents can install a `SKILL.md` that teaches them the API, and then take instructions
like `/notation underline the page title`.

```bash
npx skills add abdrizik/notation
```

## Usage

`annotate()` returns an `Annotation`. Nothing is drawn until you call `show()`.

```js
import { annotate } from '@shardsui/notation'

const a = annotate('#title', {
  type: 'circle',
  color: 'crimson',
  padding: [6, 10]
})

a.show()
```

The target is an element or a selector string. A selector matches _every_ element it finds, so
`annotate('.term', { type: 'underline' })` underlines all of them. A selector that matches nothing
warns and returns an annotation whose methods do nothing.

`show()`, `hide()` and `update()` return the annotation, so calls chain. `finished` settles when the
stroke lands.

## Types

`type` is the only required option. Eight are built in.

```js
annotate('#title', {
  type: 'underline' // [!code highlight]
})
```

:types

## Options

Each option below shows the call that draws it.

```js
annotate('#title', {
  type: 'underline',
  color: 'crimson', // [!code highlight]
  strokeWidth: 5 // [!code highlight]
})
```

:options

## Multiline

Wrapped text gets one mark per line box. Resize the window and the strokes follow the new wrap.

::demo{name="multiline"}

```js
annotate('#paragraph', {
  type: 'underline',
  multiline: true // [!code highlight]
}).show()
```

::

## Hiding

`hide()` draws the stroke backwards until nothing is left. Read `showing` to pick the direction.
A second `show()` during the retraction picks the pen up where it left off.

::demo{name="hiding"}

```js
const flag = annotate('#clause', { type: 'box' })

control.onclick = () => (flag.showing ? flag.hide() : flag.show()) // [!code highlight]
```

::

## Custom shapes

`type` also takes a function. It receives the measured box and returns an array of strokes, each
one a list of points or a [Spine](#api-reference-spine). The built-in types use the same contract.
Build coordinates from `rect.x` and `rect.y`; the box is not at the origin.

```js
annotate('#title', {
  type: underline // [!code highlight]
})

function underline(rect) {
  // [!code highlight:4]
  const y = rect.y + rect.h
  const line = [
    [rect.x, y],
    [rect.x + rect.w, y]
  ]
  return [line]
}
```

:shapes

`multiline` is `false` for custom shapes, so your function gets the whole bounding box. Set it to
`true` to run once per line. The second argument carries the rest of the options, with `padding`
resolved to four numbers. To give a shape parameters, return it from a function.

## Multiple targets

One call can cover several targets. Pass `[target, config]` pairs; the strokes draw in the order
you list them, each waiting for the one before it. `hide()` retracts them together.

::demo{name="group"}

```js
const a = annotate([
  ['#target', { type: 'circle', padding: [2, 6] }],
  ['#type', { type: 'highlight' }],
  ['#call', { type: 'underline' }],
  ['#snippet', { type: 'box' }]
])

a.show()
```

::

## Frameworks

Draw when the element mounts, and call `remove()` when it unmounts.

::tabs{labels="React,Vue,Svelte"}
:::tab{label="React"}

```tsx
import { annotate } from '@shardsui/notation' // [!code highlight]

export function Title() {
  return (
    <h1
      ref={(node) => {
        const a = annotate(node, { type: 'underline' }) // [!code highlight:3]
        a.show()
        return () => a.remove()
      }}
    >
      Hand-drawn annotations
    </h1>
  )
}
```

:::
:::tab{label="Vue"}

```vue
<script setup>
import { useTemplateRef, watchEffect } from 'vue'
import { annotate } from '@shardsui/notation' // [!code highlight]

const title = useTemplateRef('title')

watchEffect((onCleanup) => {
  if (!title.value) return
  const a = annotate(title.value, { type: 'underline' }) // [!code highlight:3]
  a.show()
  onCleanup(() => a.remove())
})
</script>

<template>
  <h1 ref="title">Hand-drawn annotations</h1>
</template>
```

:::
:::tab{label="Svelte"}

```svelte
<script>
  import { annotate } from '@shardsui/notation' // [!code highlight]

  function underline(node) {
    const a = annotate(node, { type: 'underline' }) // [!code highlight:3]
    a.show()
    return () => a.remove()
  }
</script>

<h1 {@attach underline}>Hand-drawn annotations</h1>
```

:::
::

## API reference

### AnnotationOptions

The second argument to `annotate()`.

::table{columns="Option,Type,Default"}

| Option        | Type                      | Default              | Description                                                                                                                            |
| ------------- | ------------------------- | -------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `type`        | `AnnotationType \| Shape` | —                    | Required. One of the eight types above, or a [shape of your own](#custom-shapes).                                                      |
| `color`       | `string`                  | `'currentColor'`     | Any CSS color. Inherits from the element by default.                                                                                   |
| `strokeWidth` | `number`                  | `1.5`                | Ignored by `highlight`, which always spans the line height.                                                                            |
| `padding`     | `Padding`                 | `5`                  | A number, or a CSS-shorthand tuple of up to four.                                                                                      |
| `iterations`  | `number`                  | `1`                  | How many times the stroke is drawn over itself.                                                                                        |
| `rtl`         | `boolean`                 | `false`              | Start the stroke from the right.                                                                                                       |
| `wobble`      | `number`                  | `1`                  | How unsteady the hand is. `0` draws perfectly neat.                                                                                    |
| `duration`    | `number`                  | `800`                | Milliseconds. `0` draws instantly.                                                                                                     |
| `delay`       | `number`                  | `0`                  | Milliseconds before the stroke starts.                                                                                                 |
| `easing`      | `string`                  | pen-paced `linear()` | Any CSS easing, applied per stroke.                                                                                                    |
| `side`        | `Side \| Side[]`          | —                    | Which side the mark sits on. `bracket` takes one or several, defaulting to `'right'`; `arrow` takes the first, defaulting to `'left'`. |
| `multiline`   | `boolean`                 | see description      | One mark per line box instead of one around the whole bounding box. On for `underline`, `strike-through` and `highlight`.              |
| `seed`        | `number`                  | random               | Fix the randomness, so the mark redraws identically.                                                                                   |

::

### Annotation

One handle, however many elements the call matched. Its methods drive all of them together.

::table{columns="Member,Type"}

| Member            | Type                      | Description                                                                |
| ----------------- | ------------------------- | -------------------------------------------------------------------------- |
| `showing`         | `boolean`                 | Readonly. True while ink is on screen, including during a `hide()`.        |
| `finished`        | `Promise<void>`           | Readonly. Settles when the stroke in flight lands.                         |
| `update(options)` | `(options) => Annotation` | Changes any option above and redraws. Keys you leave out keep their value. |
| `show()`          | `() => Annotation`        | Draws it. Over several elements each stroke waits for the one before it.   |
| `hide()`          | `() => Annotation`        | Runs the stroke backwards. Several elements retract together.              |
| `remove()`        | `() => void`              | Final. Takes the mark down and stops watching the element.                 |

::

### Spine

A stroke can be a bare `points` array. Use a Spine when it needs one of the other keys.

::table{columns="Key,Type"}

| Key         | Type                 | Description                                                         |
| ----------- | -------------------- | ------------------------------------------------------------------- |
| `points`    | `[number, number][]` | Two or more points, resampled evenly. Corners need no extra detail. |
| `closed`    | `boolean`            | Joins the last point back to the first, and overshoots the join.    |
| `overshoot` | `boolean`            | Runs past the last point, the way a hand overshoots a corner.       |
| `width`     | `number`             | Stroke width for this stroke alone, overriding `strokeWidth`.       |

::

## Browser support

Chrome and Edge 113, Firefox 115, and Safari 17.4 or later.
