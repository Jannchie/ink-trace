# Ink Trace

Canvas ink stroke simulation extracted from `ink_engine_full_transparent.html`.

## Packages

- `@ink-trace/core`: framework-agnostic Canvas renderer.
- `@ink-trace/react`: React canvas component.
- `@ink-trace/vue`: Vue canvas component.
- `ink-trace-playground`: native TypeScript playground for preset tuning.

## Usage

```ts
import { createInkTrace } from "@ink-trace/core";

const canvas = document.querySelector<HTMLCanvasElement>("canvas")!;

createInkTrace(canvas, {
  preset: "fountainPen",
  shape: "signature",
  seed: 1
}).render();
```

React:

```tsx
import { InkTraceCanvas } from "@ink-trace/react";

export function Demo() {
  return <InkTraceCanvas preset="brushPen" shape="signature" />;
}
```

Vue:

```vue
<script setup lang="ts">
import { InkTraceCanvas } from "@ink-trace/vue";
</script>

<template>
  <InkTraceCanvas preset="brushPen" shape="signature" />
</template>
```

## Presets And Shapes

Built-in presets:

- `fountainPen`
- `fineliner`
- `brushPen`
- `dipPen`
- `ballpoint`
- `marker`
- `calligraphy`
- `sketch`

Built-in shapes:

- `all`
- `bezier`
- `line`
- `rect`
- `circle`
- `triangle`
- `arrow`
- `flowchart`
- `signature`

The default shape is `rect`.

Pass `paths` for custom SVG path data:

```ts
createInkTrace(canvas, {
  preset: "dipPen",
  paths: [
    {
      d: "M 200 400 C 400 260, 760 540, 1100 340",
      closed: false
    }
  ]
}).render();
```

The canvas is transparent by default. Use CSS on the parent element for preview backgrounds, or pass `backgroundColor` when you want the renderer to fill the canvas.

## Development

```bash
pnpm install
pnpm dev
```

Build all packages and the playground:

```bash
pnpm build
```
