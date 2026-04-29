import { createRequire } from 'node:module';
import { performance } from 'node:perf_hooks';

const requireFromCore = createRequire(new URL('../packages/core/package.json', import.meta.url));
const svgPathModule = await import(requireFromCore.resolve('svg-path-properties'));
const { color: parseColor, hsl: parseHsl } = await import(requireFromCore.resolve('d3-color'));
const SvgPathProperties = svgPathModule.svgPathProperties ?? svgPathModule.default?.svgPathProperties;

if (!SvgPathProperties) {
  throw new Error('Unable to load svg-path-properties');
}

const paths = [
  'M 200 350 L 1160 350',
  'M 200 550 C 400 150, 800 150, 1160 550',
  'M 400 200 L 960 200 L 960 500 L 400 500 Z',
  'M 480 350 A 200 200 0 1 0 880 350 A 200 200 0 1 0 480 350',
  'M 200 400 C 280 320, 320 480, 400 380 C 460 320, 480 460, 560 360 C 640 280, 700 480, 800 380 C 880 300, 920 460, 1000 360'
];
const colors = [
  '#1a1410',
  '#abc',
  'red',
  'rebeccapurple',
  'rgb(10, 20, 30)',
  'hsl(210, 50%, 40%)'
];

function bench(label, rounds, run) {
  const start = performance.now();
  const checksum = run(rounds);
  const ms = performance.now() - start;
  console.log(`${label}: ${ms.toFixed(2)}ms (${rounds} rounds, checksum ${checksum.toFixed(2)})`);
}

bench('path sampling', 20, (rounds) => {
  let checksum = 0;
  for (let round = 0; round < rounds; round++) {
    for (const d of paths) {
      const path = new SvgPathProperties(d);
      const length = path.getTotalLength();
      const count = Math.max(2, Math.ceil(length));
      for (let index = 0; index <= count; index++) {
        const point = path.getPointAtLength(index / count * length);
        checksum += point.x + point.y;
      }
    }
  }
  return checksum;
});

bench('color parse', 100000, (rounds) => {
  let checksum = 0;
  for (let round = 0; round < rounds; round++) {
    for (const value of colors) {
      checksum += parseColor(value)?.formatHex().charCodeAt(1) ?? 0;
    }
  }
  return checksum;
});

bench('hsl shift', 100000, (rounds) => {
  let checksum = 0;
  for (let round = 0; round < rounds; round++) {
    for (const value of colors) {
      const nextColor = parseHsl(value);
      nextColor.h = (Number.isFinite(nextColor.h) ? nextColor.h : 0) + 5;
      nextColor.l = Math.min(1, nextColor.l * 1.1);
      checksum += nextColor.formatHex().charCodeAt(1);
    }
  }
  return checksum;
});
