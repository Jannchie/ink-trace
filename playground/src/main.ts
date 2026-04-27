import {
  createInkTrace,
  cloneInkTracePreset,
  INK_TRACE_PRESETS
} from '@ink-trace/core';
import { jannchieLight } from '@jannchie/shiki-theme';
import { createHighlighterCore } from 'shiki/core';
import { createJavaScriptRegexEngine } from 'shiki/engine/javascript';
import tsxLang from 'shiki/langs/tsx.mjs';
import typescriptLang from 'shiki/langs/typescript.mjs';
import vueLang from 'shiki/langs/vue.mjs';
import type {
  InkTracePathItem,
  InkTracePreset,
  InkTracePresetName
} from '@ink-trace/core';
import type { ThemeRegistrationAny } from 'shiki/core';
import './styles.css';

type PresetChoice = InkTracePresetName | 'custom';
type PresetGroup = keyof InkTracePreset;
type FieldMap = Record<string, readonly [PresetGroup, string]>;
type SnippetTab = 'ts' | 'vue' | 'react';
type SnippetLanguage = 'typescript' | 'vue' | 'tsx';
type SnippetMap = Record<SnippetTab, string>;
type PathExampleName =
  | 'bezier'
  | 'line'
  | 'rect'
  | 'circle'
  | 'triangle'
  | 'arrow'
  | 'flowchart'
  | 'signature';

const PLAYGROUND_PATH_EXAMPLES: Record<PathExampleName, InkTracePathItem[]> = {
  line: [{ d: 'M 200 350 L 1160 350', closed: false }],
  bezier: [{ d: 'M 200 550 C 400 150, 800 150, 1160 550', closed: false }],
  rect: [{ d: 'M 400 200 L 960 200 L 960 500 L 400 500 Z', closed: true }],
  circle: [{ d: 'M 480 350 A 200 200 0 1 0 880 350 A 200 200 0 1 0 480 350', closed: true }],
  triangle: [{ d: 'M 680 150 L 1000 530 L 360 530 Z', closed: true }],
  arrow: [
    { d: 'M 200 350 L 1080 350', closed: false },
    { d: 'M 1080 350 L 1015 312', closed: false },
    { d: 'M 1080 350 L 1015 388', closed: false }
  ],
  flowchart: [
    { d: 'M 180 270 L 480 270 L 480 430 L 180 430 Z', closed: true },
    { d: 'M 880 270 L 1180 270 L 1180 430 L 880 430 Z', closed: true },
    { d: 'M 480 350 C 600 350, 760 350, 870 350', closed: false },
    { d: 'M 870 350 L 820 325', closed: false },
    { d: 'M 870 350 L 820 375', closed: false }
  ],
  signature: [
    { d: 'M 200 400 C 280 320, 320 480, 400 380 C 460 320, 480 460, 560 360 C 640 280, 700 480, 800 380 C 880 300, 920 460, 1000 360', closed: false }
  ]
};

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
const pathSelect = readElement('path-select', HTMLSelectElement);
const backgroundSelect = readElement('background-select', HTMLSelectElement);
const progressInput = readElement('progress', HTMLInputElement);
const reseedButton = readElement('reseed-button', HTMLButtonElement);
const seedReadout = readElement('seed-readout', HTMLElement);
const snippetTs = readElement('snippet-ts', HTMLElement);
const snippetVue = readElement('snippet-vue', HTMLElement);
const snippetReact = readElement('snippet-react', HTMLElement);
const copyButton = readElement('copy-button', HTMLButtonElement);
const tabButtons = Array.from(document.querySelectorAll<HTMLButtonElement>('.usage-tabs button[role="tab"]'));
const codeBlocks = Array.from(document.querySelectorAll<HTMLElement>('.usage-code'));
const snippetTargets: Record<SnippetTab, HTMLElement> = {
  ts: snippetTs,
  vue: snippetVue,
  react: snippetReact
};
const snippetLanguages = {
  ts: 'typescript',
  vue: 'vue',
  react: 'tsx'
} as const satisfies Record<SnippetTab, SnippetLanguage>;
const codeTheme = jannchieLight as ThemeRegistrationAny;
const highlighterPromise = createHighlighterCore({
  themes: [codeTheme],
  langs: [typescriptLang, vueLang, tsxLang],
  engine: createJavaScriptRegexEngine()
});

let seed = 1;
let settings = cloneInkTracePreset('fountainPen');
let snippetVersion = 0;
const trace = createInkTrace(canvas);

syncSettingsToUI();
updateValue('progress');
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

pathSelect.addEventListener('change', render);
progressInput.addEventListener('input', () => {
  updateValue('progress');
  render();
});
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
  const paths = readSelectedPaths();
  const progress = readProgress();

  seedReadout.textContent = `seed: ${seed}`;
  trace.update({
    preset: settings,
    paths,
    seed,
    progress
  });
  updateSnippets(preset, paths, progress);
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

function readSelectedPaths(): InkTracePathItem[] {
  const selected = pathSelect.value as PathExampleName;
  const paths = PLAYGROUND_PATH_EXAMPLES[selected] ?? PLAYGROUND_PATH_EXAMPLES.rect;
  return paths.map((path) => ({ ...path }));
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

function updateSnippets(preset: PresetChoice, paths: InkTracePathItem[], progress: number): void {
  const options = buildOptionsObject(preset, paths, progress);
  const snippets: SnippetMap = {
    ts: renderTsSnippet(options),
    vue: renderVueSnippet(options),
    react: renderReactSnippet(options)
  };
  const version = ++snippetVersion;

  Object.entries(snippets).forEach(([tab, code]) => {
    snippetTargets[tab as SnippetTab].textContent = code;
  });

  void highlightSnippets(snippets, version);
}

async function highlightSnippets(snippets: SnippetMap, version: number): Promise<void> {
  try {
    const highlighter = await highlighterPromise;
    if (version !== snippetVersion) return;

    (Object.keys(snippets) as SnippetTab[]).forEach((tab) => {
      const html = highlighter.codeToHtml(snippets[tab], {
        lang: snippetLanguages[tab],
        theme: codeTheme
      });
      snippetTargets[tab].innerHTML = extractCodeHtml(html, snippets[tab]);
    });
  } catch (error) {
    console.error('Failed to highlight snippets', error);
  }
}

function extractCodeHtml(html: string, fallback: string): string {
  const template = document.createElement('template');
  template.innerHTML = html.trim();
  return template.content.querySelector('code')?.innerHTML ?? escapeHtml(fallback);
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => {
    const entities: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    };
    return entities[char] ?? char;
  });
}

interface SnippetOptions {
  preset?: InkTracePresetName;
  settings?: InkTracePreset;
  paths: InkTracePathItem[];
  seed?: number;
  progress?: number;
}

function buildOptionsObject(preset: PresetChoice, paths: InkTracePathItem[], progress: number): SnippetOptions {
  const options: SnippetOptions = { paths };

  if (preset === 'custom') options.settings = settings;
  else if (preset !== 'fountainPen') options.preset = preset;

  if (seed !== 1) options.seed = seed;
  if (progress !== 1) options.progress = progress;
  return options;
}

function renderTsSnippet(options: SnippetOptions): string {
  const body = formatTsObject(options, 0);
  return [
    `import { createInkTrace } from '@ink-trace/core';`,
    `const canvas = document.querySelector<HTMLCanvasElement>('canvas')!;`,
    body === '{}'
      ? `createInkTrace(canvas).render();`
      : `createInkTrace(canvas, ${body}).render();`
  ].join('\n');
}

function renderVueSnippet(options: SnippetOptions): string {
  const attrs = formatVueAttrs(options);
  const tag = attrs ? `<InkTraceCanvas\n${attrs}\n/>` : `<InkTraceCanvas />`;
  const setup = [`const paths = ${formatTsObject(options.paths, 0)};`];
  if (options.settings) setup.push(`const settings = ${formatTsObject(options.settings, 0)};`);

  return [
    `<script setup lang="ts">`,
    `import { InkTraceCanvas } from '@ink-trace/vue';`,
    setup.join('\n'),
    `</script>`,
    `<template>`,
    indent(tag, 1),
    `</template>`
  ].join('\n');
}

function renderReactSnippet(options: SnippetOptions): string {
  const attrs = formatReactAttrs(options);
  const constants = [`const paths = ${formatTsObject(options.paths, 0)};`];
  if (options.settings) constants.push(`const settings = ${formatTsObject(options.settings, 0)};`);
  const tag = attrs ? `<InkTraceCanvas\n${attrs}\n    />` : `<InkTraceCanvas />`;

  return [
    `import { InkTraceCanvas } from '@ink-trace/react';`,
    constants.join('\n'),
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
  if (Array.isArray(value)) {
    if (value.length === 0) return '[]';

    const pad = '  '.repeat(depth + 1);
    const closePad = '  '.repeat(depth);
    const lines = value.map((item) => `${pad}${formatTsObject(item, depth + 1)}`);
    return `[\n${lines.join(',\n')}\n${closePad}]`;
  }

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
  lines.push(`  :paths="paths"`);
  if (options.settings) lines.push(`  :settings="settings"`);
  if (options.seed !== undefined) lines.push(`  :seed="${options.seed}"`);
  if (options.progress !== undefined) lines.push(`  :progress="${options.progress}"`);
  return lines.join('\n');
}

function formatReactAttrs(options: SnippetOptions): string {
  const pad = '      ';
  const lines: string[] = [];
  if (options.preset) lines.push(`${pad}preset=${JSON.stringify(options.preset)}`);
  lines.push(`${pad}paths={paths}`);
  if (options.settings) lines.push(`${pad}settings={settings}`);
  if (options.seed !== undefined) lines.push(`${pad}seed={${options.seed}}`);
  if (options.progress !== undefined) lines.push(`${pad}progress={${options.progress}}`);
  return lines.join('\n');
}

function readProgress(): number {
  return Number(progressInput.value);
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
