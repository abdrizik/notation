# Changelog

## 0.2.0

Breaking. One way to do everything.

- `group()` is gone. `annotate()` takes an array of targets for one shared config, or `[target, options]` pairs for a different look per element — either way you get one handle that draws in order and hides together.
- `update()` is gone. Annotations re-measure and redraw themselves on reflow.
- `easing` is now `ease`.
- `padding` takes a number for all sides or `{ top, right, bottom, left }` to set some — the CSS-style tuples are gone. It also means the same distance for every type; `bracket` and `arrow` no longer double it.
- Custom shapes receive `padding` resolved to `{ top, right, bottom, left }` instead of a four-number tuple, and must return `Spine[]` — bare point arrays are no longer accepted.
- `side` takes `Side | Side[]`, so `bracket` can sit on several sides at once.
- `seed` and `rtl` are gone.
- The default hand is steadier — the same character, about a quarter less wobble. `wobble` still scales it, `0` still draws perfectly neat.

## 0.1.0

- Initial release.
