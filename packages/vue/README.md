# @ink-trace/vue

Vue component for Canvas ink stroke simulation.

## Installation

```bash
pnpm add @ink-trace/core @ink-trace/vue
```

## Usage

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
  <InkTraceCanvas
    preset="brushPen"
    :paths="paths"
    view-box="0 0 1360 700"
    aria-label="Brush pen signature"
  />
</template>
```

In Nuxt, render it inside `<ClientOnly>` because the simulation uses browser Canvas APIs.

## Props

`InkTraceCanvas` accepts the core renderer options plus Vue-specific canvas props and events:

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `preset` | `InkTracePresetName \| InkTracePreset` | `"fountainPen"` | Built-in preset name or a full custom preset object. |
| `settings` | `InkTracePresetPatch` | `undefined` | Partial preset overrides grouped by `nib`, `taper`, `jitter`, `flow`, `drypen`, `splatter`, and `ink`. |
| `paths` | `InkTracePathItem[]` | `undefined` | SVG path data items to render. |
| `viewBox` | `string \| InkTraceViewBox \| null` | `undefined` | Source coordinate system, such as `"0 0 1360 700"` or `{ x, y, width, height }`. Use `view-box` in templates. |
| `seed` | `number` | `1` | Deterministic variation seed. Use the same seed for repeatable output. |
| `progress` | `number` | `1` | Stroke reveal progress from `0` to `1`. Strokes grow in path order while keeping width, jitter, grain, and splatter stable for the same seed. |
| `width` | `number` | `1360` | Canvas bitmap width. |
| `height` | `number` | `700` | Canvas bitmap height. |
| `backgroundColor` | `string` | `undefined` | Optional canvas fill color. Use `background-color` in templates. |
| `ariaLabel` | `string` | `"Ink trace preview"` | Accessible label for the canvas. Use `aria-label` in templates. |

Other attributes, including `class` and `style`, are forwarded to the `<canvas>`.

## Events

| Event | Payload | Description |
| --- | --- | --- |
| `ready` | `InkTraceController` | Emitted after the internal renderer is created. |

## Path Items

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `d` | `string` | Required | SVG path data. |
| `closed` | `boolean` | `false` | Treats the path as closed for stroke tip handling. |
| `fill` | `boolean` | `false` | Fills the path with the preset ink color instead of drawing a simulated stroke. |
| `label` | `string` | `undefined` | Optional metadata label. |
| `dashArray` | `string \| number[]` | `undefined` | SVG-like dash pattern, such as `"40 18 42"` or `[40, 18, 42]`. |
| `dashOffset` | `number` | `0` | Offset into the dash pattern. |
| `pathLength` | `number` | `undefined` | Reference length used to scale dash values. |

## Settings

Preset overrides use these sections:

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

See the root README for package installation, release setup, and core renderer examples: https://github.com/Jannchie/ink-trace#readme
