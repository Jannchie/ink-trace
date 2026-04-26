export type InkTracePresetName =
  | 'fountainPen'
  | 'fineliner'
  | 'brushPen'
  | 'dipPen'
  | 'ballpoint'
  | 'marker'
  | 'calligraphy'
  | 'sketch';

export type InkTraceShapeName =
  | 'bezier'
  | 'line'
  | 'rect'
  | 'circle'
  | 'triangle'
  | 'arrow'
  | 'flowchart'
  | 'signature'
  | 'all';

export type InkTraceTaperProfile = 'uniform' | 'centerHeavy' | 'startHeavy' | 'endHeavy' | 'tapered';
export type InkTraceTipStyle = 'sharp' | 'blunt' | 'pause' | 'hook';
export type InkTraceSpeedSimulation = 'none' | 'cornerSlow' | 'straightFast';
export type InkTraceSplatterShape = 'circle' | 'ellipse' | 'mixed';

export interface InkTraceNib {
  width: number;
  angle: number;
  flatness: number;
  splitWidth: number;
  splitAlpha: number;
}

export interface InkTraceTaper {
  variation: number;
  profile: InkTraceTaperProfile;
  startTip: number;
  endTip: number;
  tipStyle: InkTraceTipStyle;
}

export interface InkTraceJitter {
  lowFreq: number;
  highFreq: number;
  pathDeform: number;
  edgeRoughness: number;
}

export interface InkTraceFlow {
  segmentation: number;
  segmentScale: number;
  minFlow: number;
  speedSim: InkTraceSpeedSimulation;
}

export interface InkTraceDryPen {
  grainDensity: number;
  grainLength: number;
  grainAlpha: number;
}

export interface InkTraceSplatter {
  intensity: number;
  density: number;
  spread: number;
  sizeVariance: number;
  clustering: number;
  shape: InkTraceSplatterShape;
  cornerBoost: number;
  skipEnds: number;
}

export interface InkTraceInk {
  color: string;
  flowDarkness: number;
  hueJitter: number;
  alpha: number;
}

export interface InkTracePreset {
  nib: InkTraceNib;
  taper: InkTraceTaper;
  jitter: InkTraceJitter;
  flow: InkTraceFlow;
  drypen: InkTraceDryPen;
  splatter: InkTraceSplatter;
  ink: InkTraceInk;
}

export interface InkTracePresetPatch {
  nib?: Partial<InkTraceNib>;
  taper?: Partial<InkTraceTaper>;
  jitter?: Partial<InkTraceJitter>;
  flow?: Partial<InkTraceFlow>;
  drypen?: Partial<InkTraceDryPen>;
  splatter?: Partial<InkTraceSplatter>;
  ink?: Partial<InkTraceInk>;
}

export interface InkTracePathItem {
  d: string;
  closed?: boolean;
  fill?: boolean;
  label?: string;
}

export interface InkTraceOptions {
  preset?: InkTracePresetName | InkTracePreset;
  settings?: InkTracePresetPatch;
  shape?: InkTraceShapeName;
  paths?: InkTracePathItem[];
  seed?: number;
  width?: number;
  height?: number;
  backgroundColor?: string | null;
  drawLabels?: boolean;
}

export interface InkTraceController {
  render(options?: InkTraceOptions): void;
  update(options: InkTraceOptions): void;
  reseed(seed?: number): void;
  destroy(): void;
}

interface ResolvedInkTraceOptions extends Required<Pick<InkTraceOptions, 'shape' | 'seed' | 'width' | 'height' | 'drawLabels'>> {
  preset: InkTracePresetName | InkTracePreset;
  settings?: InkTracePresetPatch;
  paths?: InkTracePathItem[];
  backgroundColor: string | null;
}

interface SampledPoint {
  x: number;
  y: number;
  s: number;
  tx: number;
  ty: number;
  nx: number;
  ny: number;
  w: number;
}

interface Corner {
  idx: number;
  strength: number;
}

export const INK_TRACE_WIDTH = 1360;
export const INK_TRACE_HEIGHT = 700;

const SVG_NS = 'http://www.w3.org/2000/svg';

export const INK_TRACE_PRESETS: Record<InkTracePresetName, InkTracePreset> = {
  fountainPen: {
    nib: { width: 1.8, angle: 45, flatness: 0.2, splitWidth: 0, splitAlpha: 0 },
    taper: { variation: 0.4, profile: 'uniform', startTip: 0.08, endTip: 0.08, tipStyle: 'sharp' },
    jitter: { lowFreq: 0.5, highFreq: 0.2, pathDeform: 0.4, edgeRoughness: 0.18 },
    flow: { segmentation: 1.2, segmentScale: 200, minFlow: 0.42, speedSim: 'none' },
    drypen: { grainDensity: 0.6, grainLength: 1, grainAlpha: 0.85 },
    splatter: { intensity: 0.45, density: 0.7, spread: 1.8, sizeVariance: 0.25, clustering: 0.3, shape: 'circle', cornerBoost: 1.2, skipEnds: 0.08 },
    ink: { color: '#1a1410', flowDarkness: 0.35, hueJitter: 5, alpha: 1 }
  },
  fineliner: {
    nib: { width: 1.2, angle: 0, flatness: 0, splitWidth: 0, splitAlpha: 0 },
    taper: { variation: 0.02, profile: 'uniform', startTip: 0, endTip: 0, tipStyle: 'blunt' },
    jitter: { lowFreq: 0.05, highFreq: 0.02, pathDeform: 0, edgeRoughness: 0.02 },
    flow: { segmentation: 0.05, segmentScale: 400, minFlow: 0.85, speedSim: 'none' },
    drypen: { grainDensity: 0, grainLength: 0.5, grainAlpha: 0 },
    splatter: { intensity: 0, density: 0, spread: 1, sizeVariance: 0, clustering: 0, shape: 'circle', cornerBoost: 0, skipEnds: 0.1 },
    ink: { color: '#000000', flowDarkness: 0, hueJitter: 0, alpha: 1 }
  },
  brushPen: {
    nib: { width: 4.5, angle: 60, flatness: 0.85, splitWidth: 0, splitAlpha: 0 },
    taper: { variation: 0.85, profile: 'centerHeavy', startTip: 0.25, endTip: 0.3, tipStyle: 'sharp' },
    jitter: { lowFreq: 0.5, highFreq: 0.1, pathDeform: 0.7, edgeRoughness: 0.35 },
    flow: { segmentation: 0.9, segmentScale: 280, minFlow: 0.35, speedSim: 'cornerSlow' },
    drypen: { grainDensity: 0.95, grainLength: 2.5, grainAlpha: 0.7 },
    splatter: { intensity: 0.4, density: 0.5, spread: 1.3, sizeVariance: 0.5, clustering: 0.55, shape: 'mixed', cornerBoost: 1, skipEnds: 0.12 },
    ink: { color: '#0a0805', flowDarkness: 0.7, hueJitter: 4, alpha: 1 }
  },
  dipPen: {
    nib: { width: 1.8, angle: 30, flatness: 0.5, splitWidth: 1.8, splitAlpha: 0.6 },
    taper: { variation: 0.85, profile: 'uniform', startTip: 0.04, endTip: 0.04, tipStyle: 'sharp' },
    jitter: { lowFreq: 0.7, highFreq: 0.4, pathDeform: 0.6, edgeRoughness: 0.4 },
    flow: { segmentation: 2.8, segmentScale: 130, minFlow: 0.28, speedSim: 'none' },
    drypen: { grainDensity: 1.2, grainLength: 1.5, grainAlpha: 0.95 },
    splatter: { intensity: 1.8, density: 1.8, spread: 5, sizeVariance: 0.85, clustering: 0.85, shape: 'mixed', cornerBoost: 2.5, skipEnds: 0.06 },
    ink: { color: '#08060a', flowDarkness: 0.7, hueJitter: 12, alpha: 1 }
  },
  ballpoint: {
    nib: { width: 0.8, angle: 0, flatness: 0, splitWidth: 0, splitAlpha: 0 },
    taper: { variation: 0.25, profile: 'uniform', startTip: 0.02, endTip: 0.02, tipStyle: 'blunt' },
    jitter: { lowFreq: 0.15, highFreq: 0.7, pathDeform: 0.15, edgeRoughness: 0.15 },
    flow: { segmentation: 1, segmentScale: 100, minFlow: 0.5, speedSim: 'none' },
    drypen: { grainDensity: 0.7, grainLength: 0.5, grainAlpha: 0.55 },
    splatter: { intensity: 0.05, density: 0.2, spread: 0.8, sizeVariance: 0.05, clustering: 0.1, shape: 'circle', cornerBoost: 0.3, skipEnds: 0.1 },
    ink: { color: '#0a0a3a', flowDarkness: 0.4, hueJitter: 2, alpha: 1 }
  },
  marker: {
    nib: { width: 5.5, angle: 30, flatness: 0.85, splitWidth: 0, splitAlpha: 0 },
    taper: { variation: 0.08, profile: 'uniform', startTip: 0, endTip: 0, tipStyle: 'blunt' },
    jitter: { lowFreq: 0.3, highFreq: 0.05, pathDeform: 0.2, edgeRoughness: 0.25 },
    flow: { segmentation: 0.35, segmentScale: 350, minFlow: 0.7, speedSim: 'none' },
    drypen: { grainDensity: 0.3, grainLength: 1.2, grainAlpha: 0.5 },
    splatter: { intensity: 0, density: 0, spread: 1, sizeVariance: 0, clustering: 0, shape: 'circle', cornerBoost: 0, skipEnds: 0.1 },
    ink: { color: '#1a1410', flowDarkness: 0.1, hueJitter: 2, alpha: 0.55 }
  },
  calligraphy: {
    nib: { width: 3.5, angle: 45, flatness: 1, splitWidth: 0, splitAlpha: 0 },
    taper: { variation: 0.2, profile: 'uniform', startTip: 0.18, endTip: 0.18, tipStyle: 'pause' },
    jitter: { lowFreq: 0.25, highFreq: 0.05, pathDeform: 0.2, edgeRoughness: 0.12 },
    flow: { segmentation: 0.5, segmentScale: 280, minFlow: 0.55, speedSim: 'cornerSlow' },
    drypen: { grainDensity: 0.6, grainLength: 1.8, grainAlpha: 0.85 },
    splatter: { intensity: 0.25, density: 0.4, spread: 1.3, sizeVariance: 0.35, clustering: 0.4, shape: 'circle', cornerBoost: 1.2, skipEnds: 0.1 },
    ink: { color: '#050302', flowDarkness: 0.5, hueJitter: 3, alpha: 1 }
  },
  sketch: {
    nib: { width: 1.2, angle: 0, flatness: 0.15, splitWidth: 1.2, splitAlpha: 0.5 },
    taper: { variation: 0.7, profile: 'uniform', startTip: 0.08, endTip: 0.08, tipStyle: 'sharp' },
    jitter: { lowFreq: 1.8, highFreq: 1.2, pathDeform: 2.5, edgeRoughness: 0.5 },
    flow: { segmentation: 1.8, segmentScale: 100, minFlow: 0.35, speedSim: 'none' },
    drypen: { grainDensity: 0.85, grainLength: 1.4, grainAlpha: 0.75 },
    splatter: { intensity: 0.7, density: 1.2, spread: 3, sizeVariance: 0.5, clustering: 0.45, shape: 'mixed', cornerBoost: 1.8, skipEnds: 0.05 },
    ink: { color: '#1a1612', flowDarkness: 0.4, hueJitter: 10, alpha: 1 }
  }
};

export const INK_TRACE_SHAPES: Record<Exclude<InkTraceShapeName, 'all'>, InkTracePathItem[]> = {
  line: [{ d: 'M 200 350 L 1160 350', closed: false }],
  bezier: [{ d: 'M 200 550 C 400 150, 800 150, 1160 550', closed: false }],
  rect: [{ d: 'M 400 200 L 960 200 L 960 500 L 400 500 Z', closed: true }],
  circle: [{ d: 'M 680 350 m -200 0 a 200 200 0 1 0 400 0 a 200 200 0 1 0 -400 0', closed: true }],
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

const DEFAULT_OPTIONS: ResolvedInkTraceOptions = {
  preset: 'fountainPen',
  shape: 'rect',
  seed: 1,
  width: INK_TRACE_WIDTH,
  height: INK_TRACE_HEIGHT,
  backgroundColor: null,
  drawLabels: true
};

export function createInkTrace(canvas: HTMLCanvasElement, options: InkTraceOptions = {}): InkTraceController {
  return new InkTrace(canvas, options);
}

export function renderInkTrace(canvas: HTMLCanvasElement, options: InkTraceOptions = {}): void {
  createInkTrace(canvas, options).render();
}

export function cloneInkTracePreset(preset: InkTracePresetName | InkTracePreset): InkTracePreset {
  const base = typeof preset === 'string' ? INK_TRACE_PRESETS[preset] : preset;
  return {
    nib: { ...base.nib },
    taper: { ...base.taper },
    jitter: { ...base.jitter },
    flow: { ...base.flow },
    drypen: { ...base.drypen },
    splatter: { ...base.splatter },
    ink: { ...base.ink }
  };
}

export function mergeInkTracePreset(preset: InkTracePresetName | InkTracePreset, patch: InkTracePresetPatch = {}): InkTracePreset {
  const base = cloneInkTracePreset(preset);
  return {
    nib: { ...base.nib, ...patch.nib },
    taper: { ...base.taper, ...patch.taper },
    jitter: { ...base.jitter, ...patch.jitter },
    flow: { ...base.flow, ...patch.flow },
    drypen: { ...base.drypen, ...patch.drypen },
    splatter: { ...base.splatter, ...patch.splatter },
    ink: { ...base.ink, ...patch.ink }
  };
}

export function drawInkPath(
  ctx: CanvasRenderingContext2D,
  path: InkTracePathItem,
  preset: InkTracePresetName | InkTracePreset,
  seed = 1
): void {
  const resolved = cloneInkTracePreset(preset);
  if (path.fill) {
    fillPath(ctx, path.d, resolved.ink);
    return;
  }

  renderInkPath(ctx, path.d, resolved, seed, path);
}

export class InkTrace implements InkTraceController {
  private options: ResolvedInkTraceOptions;

  constructor(private readonly canvas: HTMLCanvasElement, options: InkTraceOptions = {}) {
    this.options = mergeOptions(DEFAULT_OPTIONS, options);
  }

  render(options: InkTraceOptions = {}): void {
    this.options = mergeOptions(this.options, options);
    renderCanvas(this.canvas, this.options);
  }

  update(options: InkTraceOptions): void {
    this.render(options);
  }

  reseed(seed = Math.floor(Math.random() * 100000)): void {
    this.render({ seed });
  }

  destroy(): void {
    const ctx = this.canvas.getContext('2d');
    ctx?.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }
}

function mergeOptions(base: ResolvedInkTraceOptions, options: InkTraceOptions): ResolvedInkTraceOptions {
  return {
    ...base,
    ...options,
    preset: options.preset ?? base.preset,
    settings: options.settings ?? base.settings,
    shape: options.shape ?? base.shape,
    paths: options.paths ?? base.paths,
    seed: numberOrDefault(options.seed, base.seed),
    width: positiveNumberOrDefault(options.width, base.width),
    height: positiveNumberOrDefault(options.height, base.height),
    backgroundColor: options.backgroundColor === undefined ? base.backgroundColor : options.backgroundColor,
    drawLabels: options.drawLabels ?? base.drawLabels
  };
}

function renderCanvas(canvas: HTMLCanvasElement, options: ResolvedInkTraceOptions): void {
  if (canvas.width !== options.width) canvas.width = options.width;
  if (canvas.height !== options.height) canvas.height = options.height;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (options.backgroundColor) {
    ctx.fillStyle = options.backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  ctx.save();
  ctx.scale(options.width / INK_TRACE_WIDTH, options.height / INK_TRACE_HEIGHT);

  if (options.shape === 'all' && !options.paths) {
    renderPresetGrid(ctx, options);
  } else {
    const preset = mergeInkTracePreset(options.preset, options.settings);
    const paths = options.paths ?? getShapePaths(options.shape);
    paths.forEach((path, index) => {
      if (path.fill) {
        fillPath(ctx, path.d, preset.ink);
      } else {
        renderInkPath(ctx, path.d, preset, options.seed + index * 7, path);
      }
    });
  }

  ctx.restore();
}

function renderPresetGrid(ctx: CanvasRenderingContext2D, options: ResolvedInkTraceOptions): void {
  const names = Object.keys(INK_TRACE_PRESETS) as InkTracePresetName[];
  const cols = 4;
  const rows = 2;
  const cellW = INK_TRACE_WIDTH / cols;
  const cellH = INK_TRACE_HEIGHT / rows;

  names.forEach((name, index) => {
    const row = Math.floor(index / cols);
    const col = index % cols;
    const cx = col * cellW + cellW / 2;
    const cy = row * cellH + cellH / 2;
    const scale = Math.min(cellW, cellH) / 700 * 0.85;
    const x0 = cx - 450 * scale;
    const d = `M ${x0} ${cy} C ${x0 + 80 * scale} ${cy - 80 * scale}, ${x0 + 120 * scale} ${cy + 80 * scale}, ${x0 + 200 * scale} ${cy - 20 * scale} C ${x0 + 260 * scale} ${cy - 80 * scale}, ${x0 + 280 * scale} ${cy + 60 * scale}, ${x0 + 360 * scale} ${cy - 40 * scale} C ${x0 + 440 * scale} ${cy - 120 * scale}, ${x0 + 500 * scale} ${cy + 80 * scale}, ${x0 + 600 * scale} ${cy - 20 * scale} C ${x0 + 680 * scale} ${cy - 100 * scale}, ${x0 + 720 * scale} ${cy + 60 * scale}, ${x0 + 800 * scale} ${cy - 40 * scale} L ${x0 + 900 * scale} ${cy - 40 * scale}`;
    const preset = cloneInkTracePreset(name);
    preset.nib.width *= scale * 1.4;
    renderInkPath(ctx, d, preset, options.seed + index * 17, { closed: false });

    if (options.drawLabels) {
      ctx.fillStyle = 'rgba(71, 85, 105, 0.8)';
      ctx.font = '13px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'alphabetic';
      ctx.fillText(name, cx, row * cellH + 22);
    }
  });
}

function getShapePaths(shape: InkTraceShapeName): InkTracePathItem[] {
  return shape === 'all' ? INK_TRACE_SHAPES.signature : INK_TRACE_SHAPES[shape];
}

function renderInkPath(
  ctx: CanvasRenderingContext2D,
  d: string,
  preset: InkTracePreset,
  seed: number,
  item: Pick<InkTracePathItem, 'closed'>
): void {
  const sample = samplePath(d, 1, ctx.canvas.ownerDocument);
  if (!sample || sample.points.length < 2) return;

  const points = sample.points;
  const len = sample.length;
  const { nib, taper, jitter, flow, drypen, splatter, ink } = preset;
  const inkA = ink.alpha ?? 1;

  deformPath(points, jitter, seed);
  resolveTangents(points);
  jitterPath(points, jitter, seed);

  const corners = findCorners(points);
  const flowArr = resolveFlow(points, flow, corners, seed);
  resolveWidths(points, len, preset, flowArr, seed, item.closed);
  drawFlowingStroke(ctx, points, flowArr, preset, seed);
  drawSplitNib(ctx, points, flowArr, preset, inkA);
  drawSplatter(ctx, points, len, corners, flowArr, preset, seed);
}

function deformPath(points: SampledPoint[], jitter: InkTraceJitter, seed: number): void {
  if (jitter.pathDeform <= 0) return;

  points.forEach((point) => {
    const dx = (fbm(point.s * 0.003, seed + 100) - 0.5) * 2;
    const dy = (fbm(point.s * 0.003, seed + 101) - 0.5) * 2;
    point.x += dx * jitter.pathDeform * 3;
    point.y += dy * jitter.pathDeform * 3;
  });
}

function resolveTangents(points: SampledPoint[]): void {
  points.forEach((point, index) => {
    const previous = points[Math.max(0, index - 1)];
    const next = points[Math.min(points.length - 1, index + 1)];
    const tx = next.x - previous.x;
    const ty = next.y - previous.y;
    const tl = Math.hypot(tx, ty) || 1;
    point.tx = tx / tl;
    point.ty = ty / tl;
    point.nx = -point.ty;
    point.ny = point.tx;
  });
}

function jitterPath(points: SampledPoint[], jitter: InkTraceJitter, seed: number): void {
  points.forEach((point) => {
    const low = (fbm(point.s * 0.04, seed) - 0.5) * 2;
    const high = (fbm(point.s * 0.25, seed + 5) - 0.5) * 2;
    const offset = low * jitter.lowFreq + high * jitter.highFreq;
    point.x += point.nx * offset;
    point.y += point.ny * offset;
  });
}

function findCorners(points: SampledPoint[]): Corner[] {
  const corners: Corner[] = [];

  for (let index = 4; index < points.length - 4; index++) {
    const a = points[index - 4];
    const b = points[index];
    const c = points[index + 4];
    const v1x = b.x - a.x;
    const v1y = b.y - a.y;
    const v2x = c.x - b.x;
    const v2y = c.y - b.y;
    const l1 = Math.hypot(v1x, v1y);
    const l2 = Math.hypot(v2x, v2y);
    if (l1 < 0.1 || l2 < 0.1) continue;

    const dot = (v1x * v2x + v1y * v2y) / (l1 * l2);
    if (dot < 0.85 && (corners.length === 0 || index - corners[corners.length - 1].idx > 8)) {
      corners.push({ idx: index, strength: (0.85 - dot) / 1.85 });
    }
  }

  return corners;
}

function resolveFlow(points: SampledPoint[], flow: InkTraceFlow, corners: Corner[], seed: number): number[] {
  const flowArr = new Array<number>(points.length);
  const segmentScale = Math.max(1, flow.segmentScale);

  points.forEach((point, index) => {
    const frequency = 1 / segmentScale;
    const low = fbm(point.s * frequency, seed + 41);
    const mid = fbm(point.s * frequency * 3.5, seed + 42);
    const env = ((low - 0.5) * 0.85 + (mid - 0.5) * 0.15) * 2;
    let amount = 1 + env * flow.segmentation * 0.5;

    if (flow.speedSim === 'cornerSlow') {
      const minDistance = nearestCornerDistance(index, corners);
      const influence = Math.exp(-minDistance / 30);
      amount = amount * (1 - influence * 0.4) + 1.05 * influence * 0.4;
    } else if (flow.speedSim === 'straightFast') {
      const minDistance = nearestCornerDistance(index, corners);
      const fastArea = 1 - Math.exp(-minDistance / 40);
      amount -= fastArea * 0.25 * flow.segmentation;
    }

    if (amount < 0.3) amount = Math.max(0, amount * 1.5 - 0.15);
    flowArr[index] = Math.max(0, Math.min(1.4, amount));
  });

  return flowArr;
}

function resolveWidths(
  points: SampledPoint[],
  length: number,
  preset: InkTracePreset,
  flowArr: number[],
  seed: number,
  closed = false
): void {
  const { nib, taper } = preset;
  const baseWidth = nib.width;
  const nibAngle = nib.angle * Math.PI / 180;

  points.forEach((point, index) => {
    const t = point.s / length;
    const noise = fbm(point.s * 0.025, seed + 7);
    let width = baseWidth * (1 + (noise - 0.5) * 2 * taper.variation);

    if (nib.flatness > 0) {
      const strokeAngle = Math.atan2(point.ty, point.tx);
      const angleDiff = Math.abs(Math.cos(strokeAngle - nibAngle));
      width *= 1 - nib.flatness * 0.85 * (1 - angleDiff);
    }

    if (flowArr[index] > 1) width *= 1 + (flowArr[index] - 1) * 0.4;
    else if (flowArr[index] < 0.5) width *= 0.5 + flowArr[index];

    if (taper.profile === 'centerHeavy') {
      const centerWidth = 1 - Math.abs(t - 0.5) * 1.2;
      width *= 0.5 + centerWidth * 0.7;
    } else if (taper.profile === 'startHeavy') {
      width *= 1.15 - t * 0.6;
    } else if (taper.profile === 'endHeavy') {
      width *= 0.55 + t * 0.6;
    } else if (taper.profile === 'tapered') {
      const edge = Math.min(t, 1 - t) * 2;
      width *= 0.25 + edge * 0.75;
    }

    if (!closed) {
      width = applyTips(width, t, taper);
    }

    point.w = Math.max(0.15, width);
  });
}

function drawFlowingStroke(
  ctx: CanvasRenderingContext2D,
  points: SampledPoint[],
  flowArr: number[],
  preset: InkTracePreset,
  seed: number
): void {
  const dryThreshold = preset.flow.minFlow;
  const deadThreshold = 0.05;
  let index = 1;

  while (index < points.length) {
    const strokeFlow = (flowArr[index - 1] + flowArr[index]) / 2;
    if (strokeFlow >= dryThreshold) {
      let end = index;
      while (end < points.length && (flowArr[end - 1] + flowArr[end]) / 2 >= dryThreshold) end++;
      strokeRange(ctx, points, flowArr, preset, index, end - 1, seed);
      index = end;
    } else if (strokeFlow > deadThreshold) {
      let end = index;
      while (end < points.length) {
        const flow = (flowArr[end - 1] + flowArr[end]) / 2;
        if (flow >= dryThreshold || flow <= deadThreshold) break;
        end++;
      }
      drawDryGrain(ctx, points, flowArr, preset, index - 1, end, seed);
      index = end;
    } else {
      let end = index;
      while (end < points.length && (flowArr[end - 1] + flowArr[end]) / 2 <= deadThreshold) end++;
      index = end;
    }
  }
}

function strokeRange(
  ctx: CanvasRenderingContext2D,
  points: SampledPoint[],
  flowArr: number[],
  preset: InkTracePreset,
  start: number,
  end: number,
  seed: number
): void {
  const { ink, jitter } = preset;
  const inkA = ink.alpha ?? 1;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  for (let k = start; k <= end; k++) {
    const a = points[k - 1];
    const b = points[k];
    const strokeFlow = (flowArr[k - 1] + flowArr[k]) / 2;
    const lightness = 1 - (strokeFlow - 0.7) * ink.flowDarkness;
    const hueOffset = (hash(k, seed + 200) - 0.5) * 2 * ink.hueJitter;
    const edgeJitter = 1 - jitter.edgeRoughness * hash(k, seed + 60) * 0.5;

    ctx.strokeStyle = shiftHue(ink.color, hueOffset, 1, clamp(lightness, 0.5, 1.3));
    ctx.lineWidth = (a.w + b.w) / 2;
    ctx.globalAlpha = Math.min(1, strokeFlow * edgeJitter * inkA);
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    if (k < points.length - 1) {
      const c = points[k + 1];
      ctx.quadraticCurveTo(b.x, b.y, (b.x + c.x) / 2, (b.y + c.y) / 2);
    } else {
      ctx.lineTo(b.x, b.y);
    }
    ctx.stroke();
  }

  ctx.globalAlpha = 1;
}

function drawDryGrain(
  ctx: CanvasRenderingContext2D,
  points: SampledPoint[],
  flowArr: number[],
  preset: InkTracePreset,
  start: number,
  end: number,
  seed: number
): void {
  const { drypen, flow, ink } = preset;
  const inkA = ink.alpha ?? 1;
  const dryThreshold = flow.minFlow || 1;

  for (let k = start; k < end; k++) {
    const localFlow = flowArr[k];
    const grainProbability = (localFlow / dryThreshold) * drypen.grainDensity;
    if (hash(k, seed + 301) > grainProbability) continue;

    const point = points[k];
    const length = point.w * (0.4 + hash(k, seed + 302) * 1.2) * drypen.grainLength;
    const thickness = point.w * (0.3 + localFlow * 0.5);
    const offset = (hash(k, seed + 303) - 0.5) * point.w * 0.6;
    const color = shiftHue(ink.color, (hash(k, seed + 304) - 0.5) * 2 * ink.hueJitter, 1, 1);
    drawGrain(
      ctx,
      point.x + point.nx * offset,
      point.y + point.ny * offset,
      point.tx,
      point.ty,
      length,
      thickness,
      (0.4 + localFlow * 0.6) * drypen.grainAlpha * inkA,
      color
    );
  }
}

function drawSplitNib(
  ctx: CanvasRenderingContext2D,
  points: SampledPoint[],
  flowArr: number[],
  preset: InkTracePreset,
  inkA: number
): void {
  const { nib, flow, ink } = preset;
  if (nib.splitWidth <= 0 || nib.splitAlpha <= 0) return;

  [-1, 1].forEach((side) => {
    ctx.globalAlpha = nib.splitAlpha * inkA;
    ctx.lineCap = 'round';
    ctx.strokeStyle = ink.color;

    let index = 1;
    while (index < points.length) {
      const localFlow = (flowArr[index - 1] + flowArr[index]) / 2;
      if (localFlow < flow.minFlow) {
        index++;
        continue;
      }

      let end = index;
      while (end < points.length && (flowArr[end - 1] + flowArr[end]) / 2 >= flow.minFlow) end++;

      ctx.beginPath();
      for (let k = index - 1; k < end; k++) {
        const point = points[k];
        const x = point.x + point.nx * nib.splitWidth * side;
        const y = point.y + point.ny * nib.splitWidth * side;
        ctx.lineWidth = point.w * 0.4;
        if (k === index - 1) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      index = end;
    }

    ctx.globalAlpha = 1;
  });
}

function drawSplatter(
  ctx: CanvasRenderingContext2D,
  points: SampledPoint[],
  length: number,
  corners: Corner[],
  flowArr: number[],
  preset: InkTracePreset,
  seed: number
): void {
  const { nib, splatter, ink } = preset;
  if (splatter.intensity <= 0) return;

  const inkA = ink.alpha ?? 1;
  const baseSpacing = 40 / Math.max(0.001, splatter.density);
  const count = Math.floor(length / baseSpacing * splatter.intensity);
  const startS = length * splatter.skipEnds;
  const endS = length * (1 - splatter.skipEnds);
  const clusterCount = Math.max(1, Math.floor(count * (1 - splatter.clustering) + count * 0.15));
  const clusters = Array.from({ length: clusterCount }, (_, k) => startS + hash(k, seed + 60) * (endS - startS));

  for (let k = 0; k < count; k++) {
    let pathS: number;
    if (splatter.clustering > 0.05) {
      const cluster = clusters[(hash(k, seed + 71) * clusters.length) | 0];
      const spread = baseSpacing * (1 + (1 - splatter.clustering) * 5);
      pathS = cluster + (hash(k, seed + 72) - 0.5) * spread;
    } else {
      pathS = hash(k, seed + 71) * length;
    }

    if (pathS < startS || pathS > endS) continue;

    const pointIndex = Math.round(pathS / length * (points.length - 1));
    const localFlow = flowArr[pointIndex];
    const threshold = Math.max(0, (localFlow - 0.4) * 1.2);
    if (hash(k, seed + 73) > threshold) continue;

    const point = points[pointIndex];
    const offsetDistance = nib.width * splatter.spread * (0.3 + hash(k, seed + 74) * 0.7);
    const offsetSide = hash(k, seed + 75) > 0.5 ? 1 : -1;
    const tangentJitter = (hash(k, seed + 76) - 0.5) * nib.width * splatter.spread * 0.6;
    const x = point.x + point.nx * offsetDistance * offsetSide + point.tx * tangentJitter;
    const y = point.y + point.ny * offsetDistance * offsetSide + point.ty * tangentJitter;
    const radius = resolveSpeckRadius(nib.width, splatter.sizeVariance, hash(k, seed + 77), seed, k);
    const color = shiftHue(ink.color, (hash(k, seed + 81) - 0.5) * 2 * ink.hueJitter, 1, 1);
    const alpha = (0.85 + hash(k, seed + 82) * 0.15) * inkA;
    drawSpeck(ctx, x, y, radius * splatter.intensity, alpha, color, splatter.shape, point.tx, point.ty, seed + k);
  }

  corners.forEach((corner) => {
    if (corner.idx < 5 || corner.idx > points.length - 5) return;

    const cornerCount = Math.floor((1 + hash(corner.idx, seed + 91) * 3) * splatter.density * splatter.cornerBoost);
    for (let k = 0; k < cornerCount; k++) {
      const point = points[corner.idx];
      const offsetDistance = nib.width * splatter.spread * (0.4 + hash(k, seed + 92 + corner.idx) * 0.8);
      const angle = hash(k, seed + 93 + corner.idx) * Math.PI * 2;
      const radius = nib.width * (0.15 + hash(k, seed + 94 + corner.idx) * (0.3 + splatter.sizeVariance * 0.5));
      const color = shiftHue(ink.color, (hash(k, seed + 95 + corner.idx) - 0.5) * 2 * ink.hueJitter, 1, 1);
      drawSpeck(
        ctx,
        point.x + Math.cos(angle) * offsetDistance,
        point.y + Math.sin(angle) * offsetDistance,
        radius * splatter.intensity,
        0.85 * inkA,
        color,
        splatter.shape,
        point.tx,
        point.ty,
        seed + 96 + corner.idx + k
      );
    }
  });
}

function samplePath(d: string, step: number, document: Document): { points: SampledPoint[]; length: number } | null {
  const svg = document.createElementNS(SVG_NS, 'svg');
  const path = document.createElementNS(SVG_NS, 'path');
  path.setAttribute('d', d);
  svg.appendChild(path);
  Object.assign(svg.style, {
    position: 'absolute',
    width: '0',
    height: '0',
    overflow: 'hidden',
    opacity: '0',
    pointerEvents: 'none'
  });

  const host = document.body ?? document.documentElement;
  host.appendChild(svg);

  try {
    const length = path.getTotalLength();
    if (!Number.isFinite(length) || length <= 0) return null;

    const count = Math.max(2, Math.ceil(length / step));
    const points: SampledPoint[] = [];
    for (let index = 0; index <= count; index++) {
      const s = index / count * length;
      const point = path.getPointAtLength(s);
      points.push({ x: point.x, y: point.y, s, tx: 0, ty: 0, nx: 0, ny: 0, w: 1 });
    }
    return { points, length };
  } finally {
    svg.remove();
  }
}

function fillPath(ctx: CanvasRenderingContext2D, d: string, ink: InkTraceInk): void {
  const path = new Path2D(d);
  ctx.fillStyle = ink.color;
  ctx.globalAlpha = (ink.alpha ?? 1) * 0.92;
  ctx.fill(path);
  ctx.globalAlpha = 1;
}

function drawSpeck(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  alpha: number,
  color: string,
  shape: InkTraceSplatterShape,
  tx: number,
  ty: number,
  seed: number
): void {
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.beginPath();

  const resolvedShape = shape === 'mixed' ? (hash(0, seed) < 0.5 ? 'circle' : 'ellipse') : shape;
  if (resolvedShape === 'circle') {
    ctx.arc(x, y, radius, 0, Math.PI * 2);
  } else {
    ctx.ellipse(x, y, radius * (1 + hash(1, seed) * 0.5), radius * 0.6, Math.atan2(ty, tx), 0, Math.PI * 2);
  }

  ctx.fill();
  ctx.globalAlpha = 1;
}

function drawGrain(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  tx: number,
  ty: number,
  length: number,
  thickness: number,
  alpha: number,
  color: string
): void {
  ctx.globalAlpha = alpha;
  ctx.lineCap = 'round';
  ctx.lineWidth = thickness;
  ctx.strokeStyle = color;
  ctx.beginPath();
  ctx.moveTo(x - tx * length / 2, y - ty * length / 2);
  ctx.lineTo(x + tx * length / 2, y + ty * length / 2);
  ctx.stroke();
  ctx.globalAlpha = 1;
}

function applyTips(width: number, t: number, taper: InkTraceTaper): number {
  let nextWidth = width;

  if (t < taper.startTip) {
    const k = t / taper.startTip;
    nextWidth *= tipMultiplier(k, taper.tipStyle, 'start');
  }

  if (t > 1 - taper.endTip) {
    const k = (1 - t) / taper.endTip;
    nextWidth *= tipMultiplier(k, taper.tipStyle, 'end');
  }

  return nextWidth;
}

function tipMultiplier(k: number, style: InkTraceTipStyle, edge: 'start' | 'end'): number {
  if (style === 'sharp') return 0.15 + k * 0.85;
  if (style === 'blunt') return 0.95 + k * 0.05;
  if (style === 'pause') return edge === 'start' ? 1.4 - k * 0.4 : 1.3 - k * 0.3;
  return edge === 'start' ? 0.4 + k * 0.6 : 0.5 + k * 0.5;
}

function resolveSpeckRadius(baseWidth: number, sizeVariance: number, sample: number, seed: number, index: number): number {
  const bigChance = 0.05 + sizeVariance * 0.15;
  const mediumChance = 0.25 + sizeVariance * 0.1;

  if (sample < 1 - mediumChance - bigChance) {
    return baseWidth * (0.15 + hash(index, seed + 78) * 0.2);
  }

  if (sample < 1 - bigChance) {
    return baseWidth * (0.3 + hash(index, seed + 79) * 0.3 * (1 + sizeVariance));
  }

  return baseWidth * (0.5 + hash(index, seed + 80) * (0.4 + sizeVariance * 1.2));
}

function nearestCornerDistance(index: number, corners: Corner[]): number {
  let minDistance = Infinity;
  corners.forEach((corner) => {
    const distance = Math.abs(index - corner.idx);
    if (distance < minDistance) minDistance = distance;
  });
  return minDistance;
}

function hash(n: number, seed: number): number {
  let h = (n * 374761393 + seed * 668265263) | 0;
  h = (h ^ (h >>> 13)) * 1274126177 | 0;
  return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
}

function noise1(x: number, seed: number): number {
  const i = Math.floor(x);
  const f = x - i;
  const a = hash(i, seed);
  const b = hash(i + 1, seed);
  const t = f * f * (3 - 2 * f);
  return a * (1 - t) + b * t;
}

function fbm(x: number, seed: number): number {
  return noise1(x, seed) * 0.6 + noise1(x * 2.3, seed + 1) * 0.25 + noise1(x * 5.1, seed + 2) * 0.15;
}

function shiftHue(hex: string, degrees: number, saturationMultiplier: number, lightnessMultiplier: number): string {
  const [r, g, b] = hexToRgb(hex);
  const rN = r / 255;
  const gN = g / 255;
  const bN = b / 255;
  const max = Math.max(rN, gN, bN);
  const min = Math.min(rN, gN, bN);
  let h = 0;
  let s = 0;
  let l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === rN) h = (gN - bN) / d + (gN < bN ? 6 : 0);
    else if (max === gN) h = (bN - rN) / d + 2;
    else h = (rN - gN) / d + 4;
    h /= 6;
  }

  h = (h + degrees / 360) % 1;
  if (h < 0) h += 1;
  s = clamp(s * saturationMultiplier, 0, 1);
  l = clamp(l * lightnessMultiplier, 0, 1);

  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  return rgbToHex(
    hueToRgb(p, q, h + 1 / 3) * 255,
    hueToRgb(p, q, h) * 255,
    hueToRgb(p, q, h - 1 / 3) * 255
  );
}

function hueToRgb(p: number, q: number, t: number): number {
  let nextT = t;
  if (nextT < 0) nextT += 1;
  if (nextT > 1) nextT -= 1;
  if (nextT < 1 / 6) return p + (q - p) * 6 * nextT;
  if (nextT < 1 / 2) return q;
  if (nextT < 2 / 3) return p + (q - p) * (2 / 3 - nextT) * 6;
  return p;
}

function hexToRgb(hex: string): [number, number, number] {
  const normalized = hex.replace('#', '').padEnd(6, '0').slice(0, 6);
  return [
    parseInt(normalized.slice(0, 2), 16),
    parseInt(normalized.slice(2, 4), 16),
    parseInt(normalized.slice(4, 6), 16)
  ];
}

function rgbToHex(r: number, g: number, b: number): string {
  return `#${[r, g, b].map((value) => clamp(Math.round(value), 0, 255).toString(16).padStart(2, '0')).join('')}`;
}

function numberOrDefault(value: number | undefined, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function positiveNumberOrDefault(value: number | undefined, fallback: number): number {
  const nextValue = numberOrDefault(value, fallback);
  return nextValue > 0 ? nextValue : fallback;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
