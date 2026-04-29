import { afterEach, describe, expect, it, vi } from 'vitest';

class FakeCanvasContext {
  canvas!: HTMLCanvasElement;
  fillStyle: string | CanvasGradient | CanvasPattern = '#000000';
  globalAlpha = 1;
  lineCap: CanvasLineCap = 'butt';
  lineJoin: CanvasLineJoin = 'miter';
  lineWidth = 1;
  strokeStyle: string | CanvasGradient | CanvasPattern = '#000000';

  arc(): void {}
  beginPath(): void {}
  clearRect(): void {}
  ellipse(): void {}
  fill(): void {}
  fillRect(): void {}
  lineTo(): void {}
  moveTo(): void {}
  quadraticCurveTo(): void {}
  restore(): void {}
  save(): void {}
  scale(): void {}
  stroke(): void {}
  translate(): void {}
}

function createFakeCanvas(): HTMLCanvasElement {
  const ctx = new FakeCanvasContext();
  const canvas = {
    height: 0,
    width: 0,
    getContext: (type: string) => (type === '2d' ? ctx : null)
  } as unknown as HTMLCanvasElement;
  ctx.canvas = canvas;
  return canvas;
}

describe('path geometry cache', () => {
  afterEach(() => {
    vi.doUnmock('svg-path-properties');
    vi.resetModules();
  });

  it('refreshes cached paths before evicting older entries', async () => {
    vi.resetModules();

    const constructedPaths: string[] = [];

    vi.doMock('svg-path-properties', async (importOriginal) => {
      const actual = await importOriginal<typeof import('svg-path-properties')>();

      class MockSvgPathProperties {
        private readonly inner: InstanceType<typeof actual.svgPathProperties>;

        constructor(d: string) {
          constructedPaths.push(d);
          this.inner = new actual.svgPathProperties(d);
        }

        getTotalLength(): number {
          return this.inner.getTotalLength();
        }

        getPointAtLength(pos: number): { x: number; y: number } {
          return this.inner.getPointAtLength(pos);
        }
      }

      return { svgPathProperties: MockSvgPathProperties };
    });

    const { createInkTrace } = await import('./index');
    const paths = Array.from({ length: 257 }, (_, index) => `M ${index} 0 L ${index + 1} 0`);
    const renderPath = (d: string): void => {
      createInkTrace(createFakeCanvas(), {
        preset: 'fineliner',
        paths: [{ d }]
      }).render();
    };

    paths.slice(0, 256).forEach(renderPath);
    renderPath(paths[0]);
    renderPath(paths[256]);
    renderPath(paths[0]);

    expect(constructedPaths.filter((path) => path === paths[0])).toHaveLength(1);
  });
});
