---
name: notation
description: Hand-drawn annotations for the web with `@shardsui/notation` — underlines, boxes, circles, highlights, strike-throughs, cross-offs, brackets and arrows, or a shape you write yourself, drawn as animated SVG strokes. Use when adding annotations to a page, choosing which annotation type fits, tuning wobble/iterations/duration/seed, sequencing several marks, writing a custom Shape, or when a mark lands in the wrong place or covers the text. Triggers on: notation, annotate(), rough-notation, hand-drawn underline, sketchy circle, marker swipe, highlight a phrase, circle a word, cross something off, annotate a heading.
---

# notation

## API

Zero dependencies, ESM only. Install it before writing any of this:

```sh
npm i @shardsui/notation
```

One function. Nothing draws until `show()`.

```js
import { annotate } from '@shardsui/notation'

annotate('#title', { type: 'underline' }).show()
```

- `annotate(target, options)` — target is an element or a selector.
- `annotate(entries)` — `[target, options][]`, one config per target.

Both return the same `Annotation`: `showing`, `finished`, `update(options)`, `show()`, `hide()`, `remove()`. All but `remove()` return the annotation, so calls chain. `finished` is a promise that settles when the stroke in flight lands.

A selector matches **every** element it finds. `annotate('.term', …)` annotates all of them, not the first.

## Choosing a type

```
What is the mark for?
├── Emphasize text, keep it readable
│   ├── One or two words ──────────────→ underline
│   └── A phrase that must survive skimming → highlight
├── Mark as wrong, done, or removed
│   ├── Inline text ───────────────────→ strike-through
│   └── A whole item or block ─────────→ crossed-off
├── Set a region apart
│   ├── Short label, single line ──────→ circle
│   ├── Rectangular region, code, image → box
│   └── Multi-line block, mark stays clear of the text → bracket
└── Point at it from outside ──────────→ arrow
```

Why the boundaries sit there:

- `circle` inflates its box (×1.1 wide, ×1.25 tall) so the loop always reads as loose and hand-thrown. Past ~2 words it swallows the neighbouring text — use `box`.
- `bracket` and `arrow` double the padding and are the only types whose ink never touches the text — the bracket sits in the margin, the arrow points in from outside. Reach for them when a mark over or around the text would compete with reading it.
- `highlight` is the only type that paints _behind_ the text. It always spans the line height and **ignores `strokeWidth`**.

## multiline

`underline`, `strike-through` and `highlight` default to `multiline: true` — one mark per line box. Everything else defaults to `false` — one mark around the whole bounding box.

Never set `multiline: true` on `box` or `circle` to "handle wrapping": you get one box per line, not one box around the paragraph.

Never set it `false` on `underline` for text that wraps: a wrapped inline element's bounding box spans the full column, so the stroke inks straight through unrelated lines.

## Numbers

| Option        | Default        | Set it to                                                                                         |
| ------------- | -------------- | ------------------------------------------------------------------------------------------------- |
| `duration`    | `800`          | `0` for instant. Otherwise leave it.                                                              |
| `iterations`  | `1`            | `2` for emphasis. Never above `3`.                                                                |
| `wobble`      | `1`            | `0.4`–`0.6` in dense UI and small text. `0` for a geometric mark. Above `2` only on display type. |
| `strokeWidth` | `1.5`          | ~`0.08em` of the font size.                                                                       |
| `seed`        | random         | Any integer, whenever the mark must look identical twice.                                         |
| `color`       | `currentColor` | Any CSS color.                                                                                    |
| `rtl`         | `false`        | `true` for right-to-left text, so the pen travels with the reading direction.                     |

**`duration` is the whole mark, not one stroke.** A four-sided box and a one-line underline both take exactly the time you asked for; nothing is scaled by length.

**Never add your own "no animation" flag.** `prefers-reduced-motion` is already forced to instant internally.

**Never set `iterations` above 3.** Retraced passes draw at 0.75 opacity over the same path; past three they stop reading as a confident mark and become a scribble.

**Always set `seed`** for screenshots, visual tests, or anything rendered server-side and hydrated — every unseeded draw is a different hand.

## Sequencing

One `annotate()` call with entries chains the strokes: `show()` finishes each before starting the next, so the set reads as one hand.

```js
annotate([
  [heading, { type: 'circle' }],
  ['.term', { type: 'underline' }]
]).show()
```

`delay` offsets one mark's start; it does not sequence a set. For order, use one `annotate()` call — each stroke waits for the previous to finish, which stays correct when the text reflows.

## Gotchas

**Draw after fonts settle.** `await document.fonts.ready` before `show()`. A webfont swap reflows text after the strokes are placed; the resize observer does redraw, but the mark visibly jumps first.

**`remove()` is final.** A later `show()` does nothing. Use `hide()` for anything you intend to bring back. An element that leaves the DOM without `remove()` drops its mark but keeps the handle usable, so `show()` works again after it is put back.

**An unknown `type` throws synchronously, from `annotate()` itself** — wrap the `annotate()` call, not `show()`, when the type comes from a variable. A selector that matches nothing warns and returns an annotation whose methods no-op.

**`highlight` needs a stacking context it can win.** It sets `position: relative` when the target computes to `static`, and `z-index: 1` when its `z-index` computes to `auto` — two separate tests. An explicit `z-index` is left alone, and the band then paints _over_ the text, so raise the target's `z-index` yourself.

**`side`** — `bracket` takes one or several (`'right'` default); `arrow` takes the first only (`'left'` default).

## Custom shapes

`type` also takes `(rect, options) => (Spine | Point[])[]` — an array of strokes. `options.padding` arrives resolved to `[top, right, bottom, left]`, never a bare number.

**Always build from `rect.x` and `rect.y`. Never assume the origin is `0, 0`.** The SVG sits next to the element, not on it, so `rect` carries a real offset — a shape that hardcodes `0` draws in the wrong place, and only for some elements, which makes it look like a wobble bug.

Each stroke is a bare list of `[x, y]` points, or a Spine — `points` plus optional `closed`, `overshoot`, `width` — when it needs one of those keys. **Strokes with fewer than two points are dropped silently** — a shape that returns nothing visible is usually one that computed a single point.

```js
function squiggle(rect, { padding }) {
  const y = rect.y + rect.h + padding[2]
  const points = []
  for (let i = 0; i <= 24; i++) {
    const t = i / 24
    points.push([rect.x + rect.w * t, y + Math.sin(t * Math.PI * 10) * 3])
  }
  return [points]
}

annotate('#title', { type: squiggle }).show()
```

Emit the minimum number of points that describes the path — they are resampled evenly before the hand sways them, so corners need no extra detail. `multiline` defaults to `false` for custom shapes.
