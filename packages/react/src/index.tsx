import { useEffect, useRef } from 'react';
import type { CSSProperties } from 'react';
import { createInkTrace, INK_TRACE_HEIGHT, INK_TRACE_WIDTH } from '@ink-trace/core';
import type { InkTraceController, InkTraceOptions } from '@ink-trace/core';

export interface InkTraceCanvasProps extends InkTraceOptions {
  'aria-label'?: string;
  ariaLabel?: string;
  className?: string;
  style?: CSSProperties;
  onReady?: (controller: InkTraceController) => void;
}

export function InkTraceCanvas({
  className,
  style,
  onReady,
  preset = 'fountainPen',
  settings,
  shape = 'rect',
  paths,
  seed = 1,
  width = INK_TRACE_WIDTH,
  height = INK_TRACE_HEIGHT,
  backgroundColor = null,
  drawLabels = true,
  ariaLabel,
  'aria-label': ariaLabelAttr
}: InkTraceCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const controllerRef = useRef<InkTraceController | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return undefined;

    const controller = createInkTrace(canvasRef.current);
    controllerRef.current = controller;
    onReady?.(controller);

    return () => {
      controller.destroy();
      controllerRef.current = null;
    };
  }, [onReady]);

  useEffect(() => {
    controllerRef.current?.update({
      preset,
      settings,
      shape,
      paths,
      seed,
      width,
      height,
      backgroundColor,
      drawLabels
    });
  }, [backgroundColor, drawLabels, height, paths, preset, seed, settings, shape, width]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      width={width}
      height={height}
      role="img"
      aria-label={ariaLabel ?? ariaLabelAttr ?? 'Ink trace preview'}
      style={{
        width: '100%',
        height: 'auto',
        display: 'block',
        ...style
      }}
    />
  );
}

export const InkTrace = InkTraceCanvas;
export default InkTraceCanvas;
