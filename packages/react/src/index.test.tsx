import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { InkTraceCanvas } from './index';

const mocks = vi.hoisted(() => {
  const controller = {
    destroy: vi.fn(),
    play: vi.fn(),
    render: vi.fn(),
    reseed: vi.fn(),
    update: vi.fn()
  };

  return {
    controller,
    createInkTrace: vi.fn(() => controller)
  };
});

vi.mock('@ink-trace/core', () => ({
  INK_TRACE_HEIGHT: 700,
  INK_TRACE_WIDTH: 1360,
  createInkTrace: mocks.createInkTrace
}));

const paths = [{ d: 'M 0 0 L 100 0' }];

beforeEach(() => {
  mocks.controller.destroy.mockClear();
  mocks.controller.play.mockClear();
  mocks.controller.render.mockClear();
  mocks.controller.reseed.mockClear();
  mocks.controller.update.mockClear();
  mocks.createInkTrace.mockClear();
  mocks.createInkTrace.mockReturnValue(mocks.controller);
});

afterEach(() => {
  document.body.innerHTML = '';
});

describe('InkTraceCanvas', () => {
  it('creates the controller with the current props before onReady fires', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);
    const onReady = vi.fn((controller) => controller.play());

    await act(async () => {
      root.render(
        <InkTraceCanvas
          preset="fineliner"
          paths={paths}
          progress={0.5}
          seed={7}
          onReady={onReady}
        />
      );
    });

    expect(mocks.createInkTrace).toHaveBeenCalledTimes(1);
    const createCall = mocks.createInkTrace.mock.calls[0] as unknown as [HTMLCanvasElement, unknown];
    expect(createCall[1]).toMatchObject({
      paths,
      preset: 'fineliner',
      progress: 0.5,
      seed: 7
    });
    expect(onReady).toHaveBeenCalledWith(mocks.controller);
    expect(mocks.controller.play).toHaveBeenCalledTimes(1);
  });

  it('does not recreate the controller when onReady changes', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);
    const firstReady = vi.fn();
    const secondReady = vi.fn();

    await act(async () => {
      root.render(<InkTraceCanvas paths={paths} onReady={firstReady} />);
    });
    await act(async () => {
      root.render(<InkTraceCanvas paths={paths} onReady={secondReady} />);
    });

    expect(mocks.createInkTrace).toHaveBeenCalledTimes(1);
    expect(firstReady).toHaveBeenCalledTimes(1);
    expect(secondReady).not.toHaveBeenCalled();
  });
});
