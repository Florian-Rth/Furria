import type { KkPageSketchDevice, KkSketchBlock } from '@furria/ui';

interface SketchShape extends Omit<KkSketchBlock, 'kind'> {
  kind: KkSketchBlock['kind'];
  slot?: string;
}

interface PageSketch {
  device: KkPageSketchDevice;
  shapes: readonly SketchShape[];
}

export interface SlotSketch {
  device: KkPageSketchDevice;
  blocks: KkSketchBlock[];
}

const CHROME: SketchShape = { kind: 'bar', x: 0, y: 0, w: 100, h: 6 };

const headlines = (y: number, w: number): SketchShape[] => [
  { kind: 'headline', x: 8, y, w, h: 5 },
  { kind: 'headline', x: 8, y: y + 7, w: w * 0.75, h: 5 },
];

const filmstrip: SketchShape[] = [0, 1, 2, 3].map((frame) => ({
  kind: 'photo',
  x: 4 + frame * 24,
  y: 26,
  w: 21,
  h: 13,
  rotate: frame % 2 === 0 ? -3 : 2,
  slot: 'events.filmstrip',
}));

const PAGE_SKETCHES: Partial<Record<string, PageSketch>> = {
  landing: {
    device: 'desktop',
    shapes: [
      CHROME,
      ...headlines(14, 42),
      { kind: 'text', x: 8, y: 30, w: 40, h: 10 },
      { kind: 'bar', x: 8, y: 44, w: 18, h: 4 },
      { kind: 'photo', x: 55, y: 13, w: 38, h: 27, rotate: -2, slot: 'landing.hero' },
      { kind: 'seal', x: 84, y: 9, w: 11, h: 9 },
      { kind: 'text', x: 8, y: 60, w: 84, h: 14 },
      { kind: 'photo', x: 8, y: 80, w: 26, h: 14 },
      { kind: 'photo', x: 37, y: 80, w: 26, h: 14 },
      { kind: 'photo', x: 66, y: 80, w: 26, h: 14 },
    ],
  },
  club: {
    device: 'desktop',
    shapes: [
      CHROME,
      ...headlines(14, 40),
      { kind: 'text', x: 8, y: 30, w: 38, h: 8 },
      { kind: 'photo', x: 55, y: 12, w: 38, h: 27, slot: 'club.hero' },
      { kind: 'photo', x: 8, y: 50, w: 40, h: 28, slot: 'club.story' },
      { kind: 'headline', x: 54, y: 52, w: 34, h: 4 },
      { kind: 'text', x: 54, y: 59, w: 38, h: 18 },
      { kind: 'text', x: 8, y: 84, w: 84, h: 10 },
    ],
  },
  events: {
    device: 'desktop',
    shapes: [
      CHROME,
      ...headlines(10, 46),
      ...filmstrip,
      { kind: 'bar', x: 8, y: 46, w: 84, h: 10 },
      { kind: 'bar', x: 8, y: 59, w: 84, h: 10 },
      { kind: 'bar', x: 8, y: 72, w: 84, h: 10 },
    ],
  },
  gallery: {
    device: 'desktop',
    shapes: [
      CHROME,
      ...headlines(14, 38),
      { kind: 'text', x: 8, y: 30, w: 36, h: 8 },
      { kind: 'photo', x: 60, y: 10, w: 30, h: 21, rotate: 12, slot: 'gallery.stack' },
      { kind: 'photo', x: 58, y: 12, w: 18, h: 25, rotate: -8, slot: 'gallery.stack' },
      { kind: 'photo', x: 55, y: 16, w: 30, h: 21, rotate: -3, slot: 'gallery.stack' },
      { kind: 'photo', x: 8, y: 50, w: 26, h: 18 },
      { kind: 'photo', x: 37, y: 50, w: 26, h: 18 },
      { kind: 'photo', x: 66, y: 50, w: 26, h: 18 },
      { kind: 'photo', x: 8, y: 72, w: 26, h: 18 },
      { kind: 'photo', x: 37, y: 72, w: 26, h: 18 },
    ],
  },
  join: {
    device: 'desktop',
    shapes: [
      CHROME,
      ...headlines(14, 40),
      { kind: 'text', x: 8, y: 30, w: 38, h: 10 },
      { kind: 'bar', x: 8, y: 44, w: 20, h: 4 },
      { kind: 'photo', x: 55, y: 12, w: 38, h: 27, slot: 'join.hero' },
      { kind: 'bar', x: 8, y: 58, w: 84, h: 14 },
      { kind: 'bar', x: 8, y: 76, w: 84, h: 14 },
    ],
  },
  site: {
    device: 'share',
    shapes: [
      { kind: 'bar', x: 6, y: 22, w: 88, h: 58 },
      { kind: 'photo', x: 10, y: 26, w: 80, h: 30, slot: 'site.shareImage' },
      { kind: 'headline', x: 10, y: 61, w: 62, h: 5 },
      { kind: 'text', x: 10, y: 69, w: 76, h: 7 },
    ],
  },
};

const PHONE_SKETCHES: Partial<Record<string, PageSketch>> = {
  'landing.heroPhone': {
    device: 'phone',
    shapes: [
      { kind: 'photo', x: 0, y: 0, w: 100, h: 62, slot: 'landing.heroPhone' },
      CHROME,
      { kind: 'headline', x: 8, y: 44, w: 70, h: 4 },
      { kind: 'headline', x: 8, y: 50, w: 52, h: 4 },
      { kind: 'text', x: 8, y: 68, w: 84, h: 12 },
      { kind: 'bar', x: 8, y: 84, w: 40, h: 5 },
    ],
  },
};

const FALLBACK: PageSketch = { device: 'desktop', shapes: [CHROME] };

const blockOf = (shape: SketchShape, slot: string): KkSketchBlock => ({
  kind: shape.slot === slot ? 'lit' : shape.kind,
  x: shape.x,
  y: shape.y,
  w: shape.w,
  h: shape.h,
  rotate: shape.rotate,
});

export const slotSketchOf = (page: string, slot: string): SlotSketch => {
  const sketch = PHONE_SKETCHES[slot] ?? PAGE_SKETCHES[page] ?? FALLBACK;
  return { device: sketch.device, blocks: sketch.shapes.map((shape) => blockOf(shape, slot)) };
};
