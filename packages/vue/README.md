# @ink-trace/vue

Vue component for Canvas ink stroke simulation.

```vue
<script setup lang="ts">
import { InkTraceCanvas } from "@ink-trace/vue";
</script>

<template>
  <InkTraceCanvas
    preset="brushPen"
    shape="signature"
    aria-label="Brush pen signature"
  />
</template>
```

In Nuxt, render it inside `<ClientOnly>` because the simulation uses browser Canvas APIs.
