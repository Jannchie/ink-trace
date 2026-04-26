# @ink-trace/core

Framework-agnostic Canvas ink stroke simulation.

```ts
import { createInkTrace } from "@ink-trace/core";

const canvas = document.querySelector<HTMLCanvasElement>("canvas")!;

const trace = createInkTrace(canvas, {
  preset: "fountainPen",
  shape: "signature"
});

trace.render();
trace.reseed();
```

Use `settings` to override preset parameters, or pass `paths` with SVG path data for custom drawing.
