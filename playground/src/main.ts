import {
  createInkTrace,
  cloneInkTracePreset,
  INK_TRACE_PRESETS
} from '@ink-trace/core';
import type {
  InkTracePreset,
  InkTracePresetName,
  InkTraceShapeName
} from '@ink-trace/core';
import './styles.css';

type PresetChoice = InkTracePresetName | 'custom';
type PresetGroup = keyof InkTracePreset;
type FieldMap = Record<string, readonly [PresetGroup, string]>;

const FIELD_MAP = {
  'nib-width': ['nib', 'width'],
  'nib-angle': ['nib', 'angle'],
  'nib-flatness': ['nib', 'flatness'],
  'nib-split-width': ['nib', 'splitWidth'],
  'nib-split-alpha': ['nib', 'splitAlpha'],
  'taper-variation': ['taper', 'variation'],
  'taper-profile': ['taper', 'profile'],
  'taper-start-tip': ['taper', 'startTip'],
  'taper-end-tip': ['taper', 'endTip'],
  'taper-tip-style': ['taper', 'tipStyle'],
  'jitter-low': ['jitter', 'lowFreq'],
  'jitter-high': ['jitter', 'highFreq'],
  'jitter-deform': ['jitter', 'pathDeform'],
  'jitter-edge': ['jitter', 'edgeRoughness'],
  'flow-segmentation': ['flow', 'segmentation'],
  'flow-scale': ['flow', 'segmentScale'],
  'flow-min': ['flow', 'minFlow'],
  'flow-speed': ['flow', 'speedSim'],
  'dry-density': ['drypen', 'grainDensity'],
  'dry-length': ['drypen', 'grainLength'],
  'dry-alpha': ['drypen', 'grainAlpha'],
  'splatter-intensity': ['splatter', 'intensity'],
  'splatter-density': ['splatter', 'density'],
  'splatter-spread': ['splatter', 'spread'],
  'splatter-size': ['splatter', 'sizeVariance'],
  'splatter-cluster': ['splatter', 'clustering'],
  'splatter-shape': ['splatter', 'shape'],
  'splatter-corner': ['splatter', 'cornerBoost'],
  'splatter-skip': ['splatter', 'skipEnds'],
  'ink-color': ['ink', 'color'],
  'ink-darkness': ['ink', 'flowDarkness'],
  'ink-hue': ['ink', 'hueJitter'],
  'ink-alpha': ['ink', 'alpha']
} as const satisfies FieldMap;
const FIELD_IDS = Object.keys(FIELD_MAP) as Array<keyof typeof FIELD_MAP>;

const canvas = readElement('ink-canvas', HTMLCanvasElement);
const stage = readElement('stage', HTMLElement);
const presetSelect = readElement('preset-select', HTMLSelectElement);
const shapeSelect = readElement('shape-select', HTMLSelectElement);
const backgroundSelect = readElement('background-select', HTMLSelectElement);
const reseedButton = readElement('reseed-button', HTMLButtonElement);
const seedReadout = readElement('seed-readout', HTMLElement);
const snippetTs = readElement('snippet-ts', HTMLElement);
const snippetVue = readElement('snippet-vue', HTMLElement);
const snippetReact = readElement('snippet-react', HTMLElement);
const copyButton = readElement('copy-button', HTMLButtonElement);
const tabButtons = Array.from(document.querySelectorAll<HTMLButtonElement>('.usage-tabs button[role="tab"]'));
const codeBlocks = Array.from(document.querySelectorAll<HTMLElement>('.usage-code'));

let seed = 1;
let settings = cloneInkTracePreset('fountainPen');
const trace = createInkTrace(canvas);

syncSettingsToUI();
applyPreviewBackground();
render();

FIELD_IDS.forEach((id) => {
  const input = readElement(id, HTMLElement);
  const eventName = input instanceof HTMLSelectElement ? 'change' : 'input';
  input.addEventListener(eventName, () => {
    presetSelect.value = 'custom';
    syncUIToSettings();
    updateValue(id);
    render();
  });
});

presetSelect.addEventListener('change', () => {
  const preset = presetSelect.value as PresetChoice;
  if (preset !== 'custom') {
    settings = cloneInkTracePreset(preset);
    syncSettingsToUI();
  }
  render();
});

shapeSelect.addEventListener('change', render);
backgroundSelect.addEventListener('change', () => {
  applyPreviewBackground();
  render();
});

reseedButton.addEventListener('click', () => {
  seed = Math.floor(Math.random() * 100000);
  render();
});

tabButtons.forEach((button) => {
  if (button.id === 'copy-button') return;
  button.addEventListener('click', () => activateTab(button.dataset.tab || 'ts'));
});

copyButton.addEventListener('click', () => {
  const active = codeBlocks.find((block) => block.dataset.active === 'true');
  if (!active) return;

  const text = active.textContent || '';
  void navigator.clipboard.writeText(text).then(() => {
    copyButton.textContent = 'Copied';
    copyButton.dataset.state = 'copied';
    window.setTimeout(() => {
      copyButton.textContent = 'Copy';
      delete copyButton.dataset.state;
    }, 1200);
  });
});

function render(): void {
  const preset = presetSelect.value as PresetChoice;
  const shape = shapeSelect.value as InkTraceShapeName;

  seedReadout.textContent = `seed: ${seed}`;
  trace.update({
    preset: settings,
    shape,
    seed,
    drawLabels: shape === 'all'
  });
  updateSnippets(preset, shape);
}

function syncSettingsToUI(): void {
  FIELD_IDS.forEach((id) => {
    const [group, key] = FIELD_MAP[id];
    const input = readElement(id, HTMLElement);
    const value = readPresetValue(settings, group, key);

    if (input instanceof HTMLInputElement || input instanceof HTMLSelectElement) {
      input.value = String(value);
    }

    updateValue(id);
  });
}

function syncUIToSettings(): void {
  FIELD_IDS.forEach((id) => {
    const [group, key] = FIELD_MAP[id];
    const input = readElement(id, HTMLElement);
    if (!(input instanceof HTMLInputElement || input instanceof HTMLSelectElement)) return;

    const value = input.type === 'range' ? Number(input.value) : input.value;
    writePresetValue(settings, group, key, value);
  });
}

function updateValue(id: string): void {
  const input = readElement(id, HTMLElement);
  const output = document.getElementById(`${id}-value`);
  if (!output || !(input instanceof HTMLInputElement || input instanceof HTMLSelectElement)) return;

  if (input.type === 'range') {
    const value = Number(input.value);
    output.textContent = Number.isInteger(value) ? String(value) : value.toFixed(2);
  } else {
    output.textContent = input.value;
  }
}

function applyPreviewBackground(): void {
  stage.style.backgroundColor = backgroundSelect.value;
}

function activateTab(tab: string): void {
  tabButtons.forEach((button) => {
    if (button.id === 'copy-button') return;
    button.setAttribute('aria-selected', String(button.dataset.tab === tab));
  });
  codeBlocks.forEach((block) => {
    block.dataset.active = String(block.dataset.tab === tab);
  });
}

function updateSnippets(preset: PresetChoice, shape: InkTraceShapeName): void {
  const options = buildOptionsObject(preset, shape);
  snippetTs.textContent = renderTsSnippet(options);
  snippetVue.textContent = renderVueSnippet(options);
  snippetReact.textContent = renderReactSnippet(options);
}

interface SnippetOptions {
  preset?: InkTracePresetName;
  settings?: InkTracePreset;
  shape?: InkTraceShapeName;
  seed?: number;
}

function buildOptionsObject(preset: PresetChoice, shape: InkTraceShapeName): SnippetOptions {
  const options: SnippetOptions = {};

  if (preset === 'custom') options.settings = settings;
  else if (preset !== 'fountainPen') options.preset = preset;

  if (shape !== 'rect') options.shape = shape;
  if (seed !== 1) options.seed = seed;
  return options;
}

function renderTsSnippet(options: SnippetOptions): string {
  const body = formatTsObject(options, 0);
  return [
    `import { createInkTrace } from '@ink-trace/core';`,
    ``,
    `const canvas = document.querySelector<HTMLCanvasElement>('canvas')!;`,
    body === '{}'
      ? `createInkTrace(canvas).render();`
      : `createInkTrace(canvas, ${body}).render();`
  ].join('\n');
}

function renderVueSnippet(options: SnippetOptions): string {
  const attrs = formatVueAttrs(options);
  const tag = attrs ? `<InkTraceCanvas\n${attrs}\n/>` : `<InkTraceCanvas />`;
  const setup = options.settings
    ? [``, `const settings = ${formatTsObject(options.settings, 0)};`]
    : [];

  return [
    `<script setup lang="ts">`,
    `import { InkTraceCanvas } from '@ink-trace/vue';`,
    ...setup,
    `</script>`,
    ``,
    `<template>`,
    indent(tag, 1),
    `</template>`
  ].join('\n');
}

function renderReactSnippet(options: SnippetOptions): string {
  const attrs = formatReactAttrs(options);
  const settings = options.settings
    ? [``, `const settings = ${formatTsObject(options.settings, 0)};`]
    : [];
  const tag = attrs ? `<InkTraceCanvas\n${attrs}\n    />` : `<InkTraceCanvas />`;

  return [
    `import { InkTraceCanvas } from '@ink-trace/react';`,
    ...settings,
    ``,
    `export function App() {`,
    `  return (`,
    `    ${tag}`,
    `  );`,
    `}`
  ].join('\n');
}

function formatTsObject(value: unknown, depth: number): string {
  if (value === null || value === undefined) return 'undefined';
  if (typeof value === 'string') return JSON.stringify(value);
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (typeof value !== 'object') return String(value);

  const entries = Object.entries(value as Record<string, unknown>);
  if (entries.length === 0) return '{}';

  const pad = '  '.repeat(depth + 1);
  const closePad = '  '.repeat(depth);
  const lines = entries.map(([key, item]) => `${pad}${key}: ${formatTsObject(item, depth + 1)}`);
  return `{\n${lines.join(',\n')}\n${closePad}}`;
}

function formatVueAttrs(options: SnippetOptions): string {
  const lines: string[] = [];
  if (options.preset) lines.push(`  preset=${JSON.stringify(options.preset)}`);
  if (options.settings) lines.push(`  :settings="settings"`);
  if (options.shape) lines.push(`  shape=${JSON.stringify(options.shape)}`);
  if (options.seed !== undefined) lines.push(`  :seed="${options.seed}"`);
  return lines.join('\n');
}

function formatReactAttrs(options: SnippetOptions): string {
  const pad = '      ';
  const lines: string[] = [];
  if (options.preset) lines.push(`${pad}preset=${JSON.stringify(options.preset)}`);
  if (options.settings) lines.push(`${pad}settings={settings}`);
  if (options.shape) lines.push(`${pad}shape=${JSON.stringify(options.shape)}`);
  if (options.seed !== undefined) lines.push(`${pad}seed={${options.seed}}`);
  return lines.join('\n');
}

function indent(text: string, levels: number): string {
  const pad = '  '.repeat(levels);
  return text
    .split('\n')
    .map((line) => (line ? pad + line : line))
    .join('\n');
}

function readPresetValue(preset: InkTracePreset, group: PresetGroup, key: string): unknown {
  return (preset[group] as unknown as Record<string, unknown>)[key];
}

function writePresetValue(preset: InkTracePreset, group: PresetGroup, key: string, value: string | number): void {
  (preset[group] as unknown as Record<string, string | number>)[key] = value;
}

function readElement<T extends Element>(
  id: string,
  constructor: new (...args: never[]) => T
): T {
  const element = document.getElementById(id);
  if (!(element instanceof constructor)) {
    throw new Error(`Missing #${id}`);
  }
  return element;
}
