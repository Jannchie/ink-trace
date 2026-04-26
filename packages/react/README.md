# @ink-trace/react

React component for Canvas ink stroke simulation.

```tsx
import { InkTraceCanvas } from "@ink-trace/react";

export function Demo() {
  return (
    <InkTraceCanvas
      preset="brushPen"
      shape="signature"
      aria-label="Brush pen signature"
    />
  );
}
```

The component renders a transparent `<canvas>` by default.
