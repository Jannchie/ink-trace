# Ink Trace

Ink Trace renders SVG path data as simulated ink strokes on Canvas. It ships a framework-agnostic core package plus React and Vue bindings.

## Installation

Install the core package when you want to render into an existing canvas element:

```bash
pnpm add @ink-trace/core
```

Install the matching framework binding for React or Vue:

```bash
pnpm add @ink-trace/core @ink-trace/react
pnpm add @ink-trace/core @ink-trace/vue
```

## Quick Start

### Core

```ts
import { createInkTrace } from "@ink-trace/core";

const canvas = document.querySelector<HTMLCanvasElement>("canvas")!;
const paths = [
  {
    d: "M 200 400 C 280 320, 320 480, 400 380 C 460 320, 480 460, 560 360 C 640 280, 700 480, 800 380 C 880 300, 920 460, 1000 360",
    closed: false
  }
];

createInkTrace(canvas, {
  preset: "fountainPen",
  paths,
  seed: 1
}).render();
```

### React

```tsx
import { InkTraceCanvas } from "@ink-trace/react";

const paths = [
  {
    d: "M 200 400 C 280 320, 320 480, 400 380 C 460 320, 480 460, 560 360 C 640 280, 700 480, 800 380 C 880 300, 920 460, 1000 360",
    closed: false
  }
];

export function Demo() {
  return <InkTraceCanvas preset="brushPen" paths={paths} aria-label="Brush pen signature" />;
}
```

### Vue

```vue
<script setup lang="ts">
import { InkTraceCanvas } from "@ink-trace/vue";

const paths = [
  {
    d: "M 200 400 C 280 320, 320 480, 400 380 C 460 320, 480 460, 560 360 C 640 280, 700 480, 800 380 C 880 300, 920 460, 1000 360",
    closed: false
  }
];
</script>

<template>
  <InkTraceCanvas preset="brushPen" :paths="paths" aria-label="Brush pen signature" />
</template>
```

## Paths And Canvas Coordinates

Pass `paths` with SVG path data:

```ts
createInkTrace(canvas, {
  preset: "dipPen",
  width: 1440,
  height: 320,
  viewBox: "0 0 1440 320",
  paths: [
    {
      d: "M 200 180 C 400 80, 760 300, 1100 180",
      closed: false,
      dashArray: "40 18 42",
      pathLength: 100
    }
  ]
}).render();
```

Use `viewBox` when your path data comes from an existing SVG and you want the canvas to preserve that coordinate system.

The canvas is transparent by default. Use CSS on the parent element for preview backgrounds, or pass `backgroundColor` when you want the renderer to fill the canvas.

## Presets

Built-in presets:

- `fountainPen`
- `fineliner`
- `brushPen`
- `dipPen`
- `ballpoint`
- `marker`
- `calligraphy`
- `sketch`

Use `settings` to override only the preset fields you need:

```ts
createInkTrace(canvas, {
  preset: "brushPen",
  settings: {
    nib: { width: 5 },
    ink: { color: "#111111", alpha: 0.9 },
    splatter: { intensity: 0.2 }
  },
  paths
}).render();
```

## Animation

Animate stroke growth with `play()`:

```ts
const trace = createInkTrace(canvas, {
  preset: "brushPen",
  paths,
  progress: 0
});

trace.play({
  strokeDuration: 1200,
  strokeDelay: 120
});
```

`play()` defaults to `strokeDuration: 1200`, `strokeDelay: 0`, and `easing: "easeInOut"`.
It accepts `strokeDuration`, `strokeDelay`, `from`, `to`, `easing`, `onUpdate`, and `onFinish`.
`strokeDuration` is each path item's drawing time.
`strokeDelay` is the start-time offset between adjacent path items; use `0` for simultaneous strokes or the same value as `strokeDuration` for sequential strokes.
If `strokeDuration` is not set, `duration` is used as a fallback.
`easing` defaults to `"easeInOut"` and can be `"linear"`, `"easeIn"`, `"easeOut"`, `"easeInOut"`, or a custom `(t) => number` function.

## Configuration

Core renderer options:

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `preset` | `InkTracePresetName \| InkTracePreset` | `"fountainPen"` | Built-in preset name or a full custom preset object. |
| `settings` | `InkTracePresetPatch` | `undefined` | Partial preset overrides grouped by `nib`, `taper`, `jitter`, `flow`, `drypen`, `splatter`, and `ink`. |
| `paths` | `InkTracePathItem[]` | `[]` | SVG path data items to render. |
| `viewBox` | `string \| InkTraceViewBox \| null` | `null` | Source coordinate system, such as `"0 0 1360 700"` or `{ x, y, width, height }`. |
| `seed` | `number` | `1` | Deterministic variation seed. Use the same seed for repeatable output. |
| `progress` | `number` | `1` | Stroke reveal progress from `0` to `1`. Strokes grow in path order while keeping width, jitter, grain, and splatter stable for the same seed. |
| `width` | `number` | `1360` | Canvas bitmap width. |
| `height` | `number` | `700` | Canvas bitmap height. |
| `backgroundColor` | `string \| null` | `null` | Optional canvas fill color. Leave `null` for transparent output. |

Path item options:

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `d` | `string` | Required | SVG path data. |
| `closed` | `boolean` | `false` | Treats the path as closed for stroke tip handling. |
| `fill` | `boolean` | `false` | Fills the path with the preset ink color instead of drawing a simulated stroke. |
| `label` | `string` | `undefined` | Optional metadata label. |
| `dashArray` | `string \| number[]` | `undefined` | SVG-like dash pattern, such as `"40 18 42"` or `[40, 18, 42]`. |
| `dashOffset` | `number` | `0` | Offset into the dash pattern. |
| `pathLength` | `number` | `undefined` | Reference length used to scale dash values. |

Preset settings are grouped by section:

| Section | Fields |
| --- | --- |
| `nib` | `width`, `angle`, `flatness`, `splitWidth`, `splitAlpha` |
| `taper` | `variation`, `profile`, `startTip`, `endTip`, `tipStyle` |
| `jitter` | `lowFreq`, `highFreq`, `pathDeform`, `edgeRoughness` |
| `flow` | `segmentation`, `segmentScale`, `minFlow`, `speedSim` |
| `drypen` | `grainDensity`, `grainLength`, `grainAlpha` |
| `splatter` | `intensity`, `density`, `spread`, `sizeVariance`, `clustering`, `shape`, `cornerBoost`, `skipEnds` |
| `ink` | `color`, `flowDarkness`, `hueJitter`, `alpha` |

Ink `color` values accept Canvas-supported CSS color strings. The renderer resolves them through Canvas and uses `ink.alpha` for stroke opacity.

Allowed string values:

| Field | Values |
| --- | --- |
| `taper.profile` | `"uniform"`, `"centerHeavy"`, `"startHeavy"`, `"endHeavy"`, `"tapered"` |
| `taper.tipStyle` | `"sharp"`, `"blunt"`, `"pause"`, `"hook"` |
| `flow.speedSim` | `"none"`, `"cornerSlow"`, `"straightFast"` |
| `splatter.shape` | `"circle"`, `"ellipse"`, `"mixed"` |

## Packages

- `@ink-trace/core`: framework-agnostic Canvas renderer.
- `@ink-trace/react`: React canvas component.
- `@ink-trace/vue`: Vue canvas component.
- `ink-trace-playground`: native TypeScript playground for preset tuning.

## Development

```bash
pnpm install
pnpm dev
```

Build all packages and the playground:

```bash
pnpm build
```

Run type checks:

```bash
pnpm check
```

## Release

Releases are published by the GitHub Actions release workflow when a `v*.*.*` tag is pushed.

Before the first trusted publish from a repository, configure npm trusted publishing for all packages:

```bash
pnpm trust:github Jannchie/ink-trace
```

Use a different repository, workflow file, or npm environment when needed:

```bash
pnpm trust:github owner/repo release.yml npm
```
