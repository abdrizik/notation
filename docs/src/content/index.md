# notation

hand-drawn :annotate[annotations] for the web

Underline a phrase, box a warning, circle the thing people keep missing. Each annotation is
a rough ink stroke animated over an ordinary DOM element, and it re-draws itself when the
text reflows. There's no component to wrap and nothing to install around it — any framework
works, so does none. Zero dependencies.

## Installation

```bash
npm install @shardsui/notation
```

Coding agents can install a `SKILL.md` that teaches them the API, then take instructions
like `/notation underline the page title`.

```bash
npx skills add abdrizik/notation
```

## Usage

One function. `annotate()` takes a target and options, and gives back an `Annotation`.
Nothing appears until you call `show()`.

```js
import { annotate } from '@shardsui/notation'

const a = annotate('#title', {
  type: 'circle',
  color: 'crimson',
  padding: 8
})

a.show()
```

The target can be an element, a selector, or an array mixing both. A selector marks _every_
element it matches, so `annotate('.term', { type: 'underline' })` underlines all of them.
If nothing matches, you get a console warning and an annotation that quietly does nothing.

`show()` and `hide()` return the annotation, so calls chain. When you need to know the ink
has landed, await `finished`.

## Types

Pick a `type` — it's the only required option. Eight are built in.

```js
annotate('#title', {
  type: 'underline' // [!code highlight]
})
```

:types

## Options

Everything else has a sensible default. Click through — each option shows the exact call
that draws it.

```js
annotate('#title', {
  type: 'underline',
  color: 'crimson', // [!code highlight]
  strokeWidth: 5 // [!code highlight]
})
```

:options

## Multiline

Text that wraps gets one mark per line. Resize the window and the strokes follow the new
line breaks on their own.

::demo{name="multiline"}

```js
const a = annotate('#paragraph', {
  type: 'underline',
  multiline: true // [!code highlight]
})

a.show()
```

::

## Hiding

`hide()` runs the stroke backwards until the ink is gone. Check `showing` to know which way
to go, and if you call `show()` mid-retraction, the pen picks up right where it stopped.

::demo{name="hiding"}

```js
const flag = annotate('#clause', { type: 'box' })

control.onclick = () => (flag.showing ? flag.hide() : flag.show()) // [!code highlight]
```

::

## Custom shapes

When the built-in types aren't enough, hand `type` a function. It gets the measured box and
returns an array of [Spines](#api-reference-spine) — one per stroke. That's the same
contract the built-in types use, so anything they can do, yours can too. One thing to
remember: the box isn't at the origin, so build coordinates from `rect.x` and `rect.y`.

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
  return [{ points: line }]
}
```

:shapes

Custom shapes get the whole bounding box by default; set `multiline: true` to run once per
line instead. The second argument carries the rest of the options, with `padding` already
resolved to `{ top, right, bottom, left }`. And if a shape needs parameters of its own,
just return it from a function.

## Multiple targets

Pass an array of targets — elements, selectors, any mix — and one call marks them all.
You hold a single handle: the strokes draw in order, each waiting for the previous one to
land, and `hide()` retracts them together.

::demo{name="group"}

```js
const a = annotate(['#first', '#second', '#third'], { type: 'underline' })

a.show()
```

::

When each target deserves its own look, pass `[target, options]` pairs instead. Same
single handle, same choreography.

```js
const a = annotate([
  ['#title', { type: 'circle' }],
  ['#term', { type: 'highlight' }]
])

a.show()
```

## Frameworks

The recipe is the same everywhere: draw when the element mounts, `remove()` when it
unmounts.

::tabs{labels="React,Vue,Svelte,Angular"}
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
:::tab{label="Angular"}

```ts
import { Component, ElementRef, DestroyRef, afterNextRender, viewChild } from '@angular/core'
import { annotate } from '@shardsui/notation' // [!code highlight]

@Component({
  selector: 'app-title',
  template: `<h1 #title>Hand-drawn annotations</h1>`
})
export class Title {
  private title = viewChild.required<ElementRef<HTMLElement>>('title')

  constructor(destroyRef: DestroyRef) {
    afterNextRender(() => {
      const a = annotate(this.title().nativeElement, { type: 'underline' }) // [!code highlight:3]
      a.show()
      destroyRef.onDestroy(() => a.remove())
    })
  }
}
```

:::
::

## API reference

### AnnotationOptions

The second argument to `annotate()`.

::table{columns="Option,Type,Default"}

| Option        | Type                      | Default              | Description                                                                                                                          |
| ------------- | ------------------------- | -------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `type`        | `AnnotationType \| Shape` | —                    | The only required option. One of the eight built-in types, or a [shape of your own](#custom-shapes).                                 |
| `color`       | `string`                  | `'currentColor'`     | Any CSS color. Left alone, the ink matches the element's text color.                                                                 |
| `strokeWidth` | `number`                  | `1.5`                | How thick the pen is. `highlight` ignores it and spans the line height.                                                              |
| `padding`     | `number \| Sides`         | `5`                  | Breathing room between the element and the mark. A number for all sides, or `{ top, right, bottom, left }` to set only some.         |
| `iterations`  | `number`                  | `1`                  | How many times the pen goes over the stroke. Two or three passes read as emphasis.                                                   |
| `wobble`      | `number`                  | `1`                  | How unsteady the hand is. `0` draws perfectly neat, higher gets shakier.                                                             |
| `duration`    | `number`                  | `800`                | Milliseconds for the whole drawing. `0` puts the ink down instantly.                                                                 |
| `delay`       | `number`                  | `0`                  | Milliseconds to wait before the pen touches down.                                                                                    |
| `ease`        | `string`                  | pen-paced `linear()` | Any CSS easing, applied per stroke. The default paces like a real pen.                                                               |
| `side`        | `Side \| Side[]`          | —                    | Where the mark sits. `bracket` takes one or several sides, defaulting to `'right'`; `arrow` takes the first, defaulting to `'left'`. |
| `multiline`   | `boolean`                 | see description      | One mark per line instead of one around the whole box. On by default for `underline`, `strike-through` and `highlight`.              |

::

### Annotation

What `annotate()` returns. One handle, however many elements matched — its methods drive
them all together.

::table{columns="Member,Type"}

| Member     | Type               | Description                                                          |
| ---------- | ------------------ | -------------------------------------------------------------------- |
| `showing`  | `boolean`          | Readonly. True while any ink is on screen, even mid-`hide()`.        |
| `finished` | `Promise<void>`    | Readonly. Settles when the stroke in flight lands.                   |
| `show()`   | `() => Annotation` | Draws the mark. Across several elements, each stroke waits its turn. |
| `hide()`   | `() => Annotation` | Draws the stroke backwards. Several elements retract at once.        |
| `remove()` | `() => void`       | The end. Takes the mark down and stops watching the element.         |

::

### Spine

One stroke, as returned by a shape. Only `points` is required.

::table{columns="Key,Type"}

| Key         | Type                 | Description                                                         |
| ----------- | -------------------- | ------------------------------------------------------------------- |
| `points`    | `[number, number][]` | Two or more points, resampled evenly. Corners need no extra detail. |
| `closed`    | `boolean`            | Joins the last point back to the first, overshooting the seam.      |
| `overshoot` | `boolean`            | Runs past the last point, the way a hand overshoots a corner.       |
| `width`     | `number`             | Stroke width for this stroke alone, overriding `strokeWidth`.       |

::

## Browser support

Chrome and Edge 113, Firefox 115, and Safari 17.4 or later.
