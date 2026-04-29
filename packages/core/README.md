# @ink-trace/core

Framework-agnostic Canvas ink stroke simulation.

## Installation

```bash
pnpm add @ink-trace/core
```

## Usage

```ts
import { createInkTrace } from "@ink-trace/core";

const canvas = document.querySelector<HTMLCanvasElement>("canvas")!;
const paths = [
  {
    d: "M 200 400 C 280 320, 320 480, 400 380 C 460 320, 480 460, 560 360 C 640 280, 700 480, 800 380 C 880 300, 920 460, 1000 360",
    closed: false
  }
];

const trace = createInkTrace(canvas, {
  preset: "fountainPen",
  paths
});

trace.render();
trace.reseed();
```

Use `settings` to override preset parameters, and pass `paths` with SVG path data for drawing.
Set `viewBox` when the path data comes from an existing SVG coordinate system.

## Options

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

## Paths

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `d` | `string` | Required | SVG path data. |
| `closed` | `boolean` | `false` | Treats the path as closed for stroke tip handling. |
| `fill` | `boolean` | `false` | Fills the path with the preset ink color instead of drawing a simulated stroke. |
| `label` | `string` | `undefined` | Optional metadata label. |
| `dashArray` | `string \| number[]` | `undefined` | SVG-like dash pattern, such as `"40 18 42"` or `[40, 18, 42]`. |
| `dashOffset` | `number` | `0` | Offset into the dash pattern. |
| `pathLength` | `number` | `undefined` | Reference length used to scale dash values. |

## Preset Settings

Pass `settings` to override only the preset fields you need:

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

| Section | Fields |
| --- | --- |
| `nib` | `width`, `angle`, `flatness`, `splitWidth`, `splitAlpha` |
| `taper` | `variation`, `profile`, `startTip`, `endTip`, `tipStyle` |
| `jitter` | `lowFreq`, `highFreq`, `pathDeform`, `edgeRoughness` |
| `flow` | `segmentation`, `segmentScale`, `minFlow`, `speedSim` |
| `drypen` | `grainDensity`, `grainLength`, `grainAlpha` |
| `splatter` | `intensity`, `density`, `spread`, `sizeVariance`, `clustering`, `shape`, `cornerBoost`, `skipEnds` |
| `ink` | `color`, `flowDarkness`, `hueJitter`, `alpha` |

Allowed string values:

| Field | Values |
| --- | --- |
| `taper.profile` | `"uniform"`, `"centerHeavy"`, `"startHeavy"`, `"endHeavy"`, `"tapered"` |
| `taper.tipStyle` | `"sharp"`, `"blunt"`, `"pause"`, `"hook"` |
| `flow.speedSim` | `"none"`, `"cornerSlow"`, `"straightFast"` |
| `splatter.shape` | `"circle"`, `"ellipse"`, `"mixed"` |

## Presets

Built-in presets are `fountainPen`, `fineliner`, `brushPen`, `dipPen`, `ballpoint`, `marker`, `calligraphy`, and `sketch`.

## Controller

| Method | Description |
| --- | --- |
| `render(options?)` | Merges options and renders the canvas. |
| `update(options)` | Alias for rendering with new options. |
| `reseed(seed?)` | Renders with a provided seed or a random seed. |
| `play(options?)` | Animates `progress` with optional `strokeDuration`, `strokeDelay`, `from`, `to`, `easing`, `onUpdate`, and `onFinish`. |
| `destroy()` | Clears the canvas. |

See the root README for package installation, release setup, and cross-framework examples: https://github.com/Jannchie/ink-trace#readme
