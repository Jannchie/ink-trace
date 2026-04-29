import { describe, expect, it } from 'vitest';
import { createInkTrace, mergeInkTracePreset } from './index';

interface StrokeCall {
  globalAlpha: number;
  lineWidth: number;
  strokeStyle: string | CanvasGradient | CanvasPattern;
}

class FakeCanvasContext {
  canvas!: HTMLCanvasElement;
  fillStyle: string | CanvasGradient | CanvasPattern = '#000000';
  globalAlpha = 1;
  lineCap: CanvasLineCap = 'butt';
  lineJoin: CanvasLineJoin = 'miter';
  lineWidth = 1;
  strokeStyle: string | CanvasGradient | CanvasPattern = '#000000';
  clears = 0;
  fills = 0;
  strokes: StrokeCall[] = [];

  reset(): void {
    this.clears = 0;
    this.fills = 0;
    this.strokes = [];
  }

  arc(): void {}
  beginPath(): void {}
  clearRect(): void { this.clears++; }
  ellipse(): void {}
  fill(): void { this.fills++; }
  fillRect(): void { this.fills++; }
  lineTo(): void {}
  moveTo(): void {}
  quadraticCurveTo(): void {}
  restore(): void {}
  save(): void {}
  scale(): void {}
  translate(): void {}

  stroke(): void {
    this.strokes.push({
      globalAlpha: this.globalAlpha,
      lineWidth: this.lineWidth,
      strokeStyle: this.strokeStyle
    });
  }
}

function createFakeCanvas(): { canvas: HTMLCanvasElement; ctx: FakeCanvasContext } {
  const ctx = new FakeCanvasContext();
  const canvas = {
    height: 0,
    width: 0,
    getContext: (type: string) => (type === '2d' ? ctx : null)
  } as unknown as HTMLCanvasElement;
  ctx.canvas = canvas;
  return { canvas, ctx };
}

const linePath = [{ d: 'M 0 0 L 100 0' }];

describe('InkTrace core', () => {
  it('clears previous paths when paths is explicitly undefined', () => {
    const { canvas, ctx } = createFakeCanvas();
    const trace = createInkTrace(canvas, { preset: 'fineliner', paths: linePath });

    trace.render();
    expect(ctx.strokes.length).toBeGreaterThan(0);

    ctx.reset();
    trace.update({ paths: undefined });

    expect(ctx.clears).toBeGreaterThan(0);
    expect(ctx.strokes).toHaveLength(0);
  });

  it('clears previous settings when settings is explicitly undefined', () => {
    const { canvas, ctx } = createFakeCanvas();
    const trace = createInkTrace(canvas, {
      preset: 'fineliner',
      settings: { ink: { color: 'red' } },
      paths: linePath
    });

    trace.render();
    expect(ctx.strokes[0]?.strokeStyle).toBe('#ff0000');

    ctx.reset();
    trace.update({ settings: undefined });

    expect(ctx.strokes[0]?.strokeStyle).toBe('#000000');
  });

  it('ignores invalid SVG path data without throwing', () => {
    const { canvas, ctx } = createFakeCanvas();
    const trace = createInkTrace(canvas, { preset: 'fineliner' });

    expect(() => trace.update({ paths: [{ d: 'not a path' }] })).not.toThrow();
    expect(ctx.strokes).toHaveLength(0);
  });

  it('draws fewer stroke segments for dashed paths', () => {
    const solid = createFakeCanvas();
    createInkTrace(solid.canvas, { preset: 'fineliner', paths: linePath }).render();

    const dashed = createFakeCanvas();
    createInkTrace(dashed.canvas, {
      preset: 'fineliner',
      paths: [{ d: 'M 0 0 L 100 0', dashArray: [10, 10] }]
    }).render();

    expect(dashed.ctx.strokes.length).toBeGreaterThan(0);
    expect(dashed.ctx.strokes.length).toBeLessThan(solid.ctx.strokes.length);
  });

  it('accepts CSS color strings for ink color', () => {
    const colors = [
      ['red', '#ff0000'],
      ['#abc', '#aabbcc'],
      ['rgb(10, 20, 30)', '#0a141e']
    ] as const;

    colors.forEach(([input, expected]) => {
      const { canvas, ctx } = createFakeCanvas();
      const preset = mergeInkTracePreset('fineliner', {
        ink: { color: input, flowDarkness: 0, hueJitter: 0 }
      });

      createInkTrace(canvas, { preset, paths: linePath }).render();

      expect(ctx.strokes[0]?.strokeStyle).toBe(expected);
    });
  });
});
