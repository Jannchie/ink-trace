import { defineComponent, h, mergeProps, onBeforeUnmount, onMounted, watch } from 'vue';
import type { PropType } from 'vue';
import { createInkTrace, INK_TRACE_HEIGHT, INK_TRACE_WIDTH } from '@ink-trace/core';
import type {
  InkTraceController,
  InkTraceOptions,
  InkTracePathItem,
  InkTracePreset,
  InkTracePresetName,
  InkTracePresetPatch,
  InkTraceViewBox
} from '@ink-trace/core';

export const InkTraceCanvas = defineComponent({
  name: 'InkTraceCanvas',
  props: {
    preset: {
      type: [String, Object] as PropType<InkTracePresetName | InkTracePreset>,
      default: 'fountainPen'
    },
    settings: {
      type: Object as PropType<InkTracePresetPatch>,
      default: undefined
    },
    paths: {
      type: Array as PropType<InkTracePathItem[]>,
      default: undefined
    },
    viewBox: {
      type: [String, Object] as PropType<string | InkTraceViewBox | null>,
      default: undefined
    },
    seed: {
      type: Number,
      default: 1
    },
    width: {
      type: Number,
      default: INK_TRACE_WIDTH
    },
    height: {
      type: Number,
      default: INK_TRACE_HEIGHT
    },
    backgroundColor: {
      type: String,
      default: undefined
    },
    ariaLabel: {
      type: String,
      default: undefined
    }
  },
  emits: {
    ready: (_controller: InkTraceController) => true
  },
  setup(props, { attrs, emit }) {
    let canvas: HTMLCanvasElement | undefined;
    let controller: InkTraceController | undefined;

    const readOptions = (): InkTraceOptions => ({
      preset: props.preset,
      settings: props.settings,
      paths: props.paths,
      viewBox: props.viewBox ?? null,
      seed: props.seed,
      width: props.width,
      height: props.height,
      backgroundColor: props.backgroundColor ?? null
    });

    const render = () => {
      controller?.update(readOptions());
    };

    onMounted(() => {
      if (!canvas) return;
      controller = createInkTrace(canvas, readOptions());
      emit('ready', controller);
      controller.render();
    });

    watch(
      () => [
        props.preset,
        props.settings,
        props.paths,
        props.viewBox,
        props.seed,
        props.width,
        props.height,
        props.backgroundColor
      ],
      render,
      { deep: true }
    );

    onBeforeUnmount(() => {
      controller?.destroy();
      controller = undefined;
    });

    return () => h('canvas', mergeProps({
      ref: (element) => {
        canvas = element instanceof HTMLCanvasElement ? element : undefined;
      },
      width: props.width,
      height: props.height,
      role: 'img',
      'aria-label': props.ariaLabel ?? readAttrAriaLabel(attrs) ?? 'Ink trace preview',
      style: {
        width: '100%',
        height: 'auto',
        display: 'block'
      }
    }, attrs));
  }
});

export const InkTrace = InkTraceCanvas;

function readAttrAriaLabel(attrs: Record<string, unknown>): string | undefined {
  const label = attrs['aria-label'];
  return typeof label === 'string' ? label : undefined;
}

export default InkTraceCanvas;
