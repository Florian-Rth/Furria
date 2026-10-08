export type LabPhotoScene = 'stage' | 'garde' | 'crowd' | 'bar' | 'parade' | 'archive';

export interface LabPhotoSpec {
  seed: number;
  scene: LabPhotoScene;
  portrait: boolean;
}

type Random = () => number;

interface ScenePalette {
  sky: readonly [string, string];
  glow: readonly string[];
  figures: readonly string[];
  floor: string;
  confetti: number;
  cones: number;
  grey: boolean;
}

const PALETTES: Record<LabPhotoScene, ScenePalette> = {
  stage: {
    sky: ['#1a0c2e', '#05040a'],
    glow: ['#ff3b47', '#ffc42e', '#5896d0', '#ff7a1a'],
    figures: ['#e11d2a', '#f4f6f8', '#ffc42e', '#1d1f26'],
    floor: '#2a0f14',
    confetti: 70,
    cones: 4,
    grey: false,
  },
  garde: {
    sky: ['#14081f', '#020203'],
    glow: ['#ffc42e', '#ffffff', '#ff3b47'],
    figures: ['#e11d2a', '#ffffff', '#e11d2a', '#ffffff', '#f4b400'],
    floor: '#3a1418',
    confetti: 24,
    cones: 3,
    grey: false,
  },
  crowd: {
    sky: ['#3a1c08', '#0d0603'],
    glow: ['#ffb347', '#ff6a3d', '#ffd98a', '#ff3b47'],
    figures: ['#1b0f08', '#2b170b', '#140a05', '#3a2412'],
    floor: '#120804',
    confetti: 40,
    cones: 1,
    grey: false,
  },
  bar: {
    sky: ['#0b2a2e', '#040b0d'],
    glow: ['#4fbf7e', '#ffc42e', '#7fb2e0', '#ff7079'],
    figures: ['#0a1416', '#132326', '#0e1a1c'],
    floor: '#061012',
    confetti: 10,
    cones: 0,
    grey: false,
  },
  parade: {
    sky: ['#9cc7ec', '#e9f2fb'],
    glow: ['#ffffff', '#fff2c4'],
    figures: ['#e11d2a', '#2f6da8', '#f4b400', '#2e9e5b', '#ffffff'],
    floor: '#8a8f99',
    confetti: 90,
    cones: 0,
    grey: false,
  },
  archive: {
    sky: ['#4a4a4a', '#141414'],
    glow: ['#e8e8e8', '#bdbdbd'],
    figures: ['#d9d9d9', '#2a2a2a', '#8c8c8c'],
    floor: '#262626',
    confetti: 30,
    cones: 2,
    grey: true,
  },
};

const LANDSCAPE = { width: 600, height: 400 } as const;
const PORTRAIT = { width: 400, height: 600 } as const;
const UINT32 = 4294967296;
const MIX_A = 0x6d2b79f5;
const DEGREES = 360;

const randomOf = (seed: number): Random => {
  let state = seed >>> 0;
  return (): number => {
    state = (state + MIX_A) >>> 0;
    let mixed = state;
    mixed = Math.imul(mixed ^ (mixed >>> 15), mixed | 1);
    mixed ^= mixed + Math.imul(mixed ^ (mixed >>> 7), mixed | 61);
    return ((mixed ^ (mixed >>> 14)) >>> 0) / UINT32;
  };
};

const pick = <TItem>(items: readonly TItem[], random: Random): TItem =>
  items[Math.floor(random() * items.length) % items.length] as TItem;

const round = (value: number): number => Math.round(value * 10) / 10;

const conesOf = (palette: ScenePalette, random: Random, width: number, height: number): string =>
  Array.from({ length: palette.cones }, () => {
    const top = round(random() * width);
    const spread = round(width * (0.12 + random() * 0.2));
    const foot = round(top + (random() - 0.5) * width * 0.6);
    const colour = pick(palette.glow, random);
    return `<polygon points="${top - 6},0 ${top + 6},0 ${foot + spread},${height} ${foot - spread},${height}" fill="${colour}" opacity="${round(0.18 + random() * 0.22)}" filter="url(#soft)"/>`;
  }).join('');

const bokehOf = (palette: ScenePalette, random: Random, width: number, height: number): string =>
  Array.from({ length: 14 }, () => {
    const radius = round(8 + random() * 34);
    return `<circle cx="${round(random() * width)}" cy="${round(random() * height * 0.6)}" r="${radius}" fill="${pick(palette.glow, random)}" opacity="${round(0.15 + random() * 0.4)}" filter="url(#soft)"/>`;
  }).join('');

const figureOf = (
  palette: ScenePalette,
  random: Random,
  x: number,
  baseline: number,
  scale: number,
  arms: boolean,
): string => {
  const body = pick(palette.figures, random);
  const accent = pick(palette.figures, random);
  const headRadius = round(9 * scale);
  const torso = round(34 * scale);
  const skirt = round(26 * scale);
  const legs = round(30 * scale);
  const headY = round(baseline - legs - skirt - torso - headRadius);
  const torsoTop = round(headY + headRadius);
  const skirtTop = round(torsoTop + torso);
  const skirtBottom = round(skirtTop + skirt);
  const half = round(12 * scale);
  const flare = round(24 * scale * (0.7 + random() * 0.6));
  const raise = round((random() - 0.3) * 40 * scale);
  const armLines = arms
    ? `<path d="M${x - half} ${torsoTop + 6} L${x - half - 22 * scale} ${torsoTop - raise}" stroke="${body}" stroke-width="${round(6 * scale)}" stroke-linecap="round"/><path d="M${x + half} ${torsoTop + 6} L${x + half + 22 * scale} ${torsoTop - raise}" stroke="${body}" stroke-width="${round(6 * scale)}" stroke-linecap="round"/>`
    : '';
  const kick = round((random() - 0.5) * 30 * scale);
  return `<g>${armLines}<circle cx="${x}" cy="${headY}" r="${headRadius}" fill="#e9c2a6"/><path d="M${x - headRadius} ${headY - headRadius * 0.4} L${x + headRadius} ${headY - headRadius * 0.4} L${x} ${headY - headRadius * 2.1} Z" fill="${accent}"/><rect x="${x - half}" y="${torsoTop}" width="${half * 2}" height="${torso}" rx="${round(4 * scale)}" fill="${body}"/><path d="M${x - half} ${skirtTop} L${x + half} ${skirtTop} L${x + flare} ${skirtBottom} L${x - flare} ${skirtBottom} Z" fill="${accent}"/><path d="M${x - 5 * scale} ${skirtBottom} L${x - 6 * scale} ${baseline}" stroke="#e9c2a6" stroke-width="${round(5 * scale)}" stroke-linecap="round"/><path d="M${x + 5 * scale} ${skirtBottom} L${x + 6 * scale + kick} ${baseline - Math.abs(kick)}" stroke="#e9c2a6" stroke-width="${round(5 * scale)}" stroke-linecap="round"/></g>`;
};

const lineUpOf = (palette: ScenePalette, random: Random, width: number, height: number): string => {
  const count = 3 + Math.floor(random() * 5);
  const baseline = height * (0.82 + random() * 0.08);
  const scale = (height / 400) * (1.15 + random() * 0.7);
  const gap = width / (count + 1);
  const offset = (random() - 0.5) * gap * 0.8;
  return Array.from({ length: count }, (_, index) =>
    figureOf(palette, random, round(gap * (index + 1) + offset), round(baseline), scale, true),
  ).join('');
};

const headsOf = (palette: ScenePalette, random: Random, width: number, height: number): string =>
  Array.from({ length: 3 }, (_, row) => {
    const y = height * (0.62 + row * 0.13);
    const radius = (height / 400) * (16 + row * 9);
    const count = Math.ceil(width / (radius * 2.2)) + 1;
    return Array.from({ length: count }, (__, index) => {
      const cx = round(index * radius * 2.2 + (random() - 0.5) * radius);
      const cy = round(y + (random() - 0.5) * radius * 0.6);
      const colour = pick(palette.figures, random);
      const hat =
        random() > 0.7
          ? `<path d="M${cx - radius} ${cy - radius * 0.5} L${cx + radius} ${cy - radius * 0.5} L${cx} ${cy - radius * 2} Z" fill="${pick(['#e11d2a', '#f4b400', '#2f6da8'], random)}"/>`
          : '';
      return `<circle cx="${cx}" cy="${round(cy)}" r="${round(radius)}" fill="${colour}"/><rect x="${round(cx - radius * 1.3)}" y="${round(cy + radius * 0.8)}" width="${round(radius * 2.6)}" height="${round(radius * 3)}" rx="${round(radius * 0.6)}" fill="${colour}"/>${hat}`;
    }).join('');
  }).join('');

const floatOf = (palette: ScenePalette, random: Random, width: number, height: number): string => {
  const x = round(width * (0.05 + random() * 0.3));
  const y = round(height * 0.5);
  const floatWidth = round(width * (0.55 + random() * 0.3));
  const floatHeight = round(height * 0.3);
  const colour = pick(palette.figures, random);
  return `<rect x="${x}" y="${y}" width="${floatWidth}" height="${floatHeight}" rx="10" fill="${colour}"/><rect x="${x}" y="${round(y + floatHeight * 0.7)}" width="${floatWidth}" height="${round(floatHeight * 0.12)}" fill="#ffffff" opacity="0.8"/>${figureOf(palette, random, round(x + floatWidth * 0.3), y, height / 500, true)}${figureOf(palette, random, round(x + floatWidth * 0.65), y, height / 520, true)}`;
};

const confettiOf = (palette: ScenePalette, random: Random, width: number, height: number): string =>
  Array.from({ length: palette.confetti }, () => {
    const size = round(3 + random() * 6);
    const colour = palette.grey
      ? pick(['#ffffff', '#9e9e9e'], random)
      : pick(['#e11d2a', '#f4b400', '#ffffff', '#2f6da8', '#2e9e5b'], random);
    return `<rect x="${round(random() * width)}" y="${round(random() * height)}" width="${size}" height="${round(size * 0.45)}" fill="${colour}" opacity="${round(0.55 + random() * 0.45)}" transform="rotate(${Math.floor(random() * DEGREES)} ${round(random() * width)} ${round(random() * height)})"/>`;
  }).join('');

const subjectOf = (
  scene: LabPhotoScene,
  palette: ScenePalette,
  random: Random,
  width: number,
  height: number,
): string => {
  if (scene === 'crowd' || scene === 'bar') {
    return headsOf(palette, random, width, height);
  }
  if (scene === 'parade') {
    return floatOf(palette, random, width, height) + headsOf(palette, random, width, height * 1.08);
  }
  return lineUpOf(palette, random, width, height);
};

export const labPhotoSourceOf = ({ seed, scene, portrait }: LabPhotoSpec): string => {
  const random = randomOf(seed);
  const palette = PALETTES[scene];
  const { width, height } = portrait ? PORTRAIT : LANDSCAPE;
  const tilt = round((random() - 0.5) * 4);
  const exposure = round(0.85 + random() * 0.35);
  const greyFilter = palette.grey ? ' filter="url(#grey)"' : '';
  const floorTop = round(height * (0.78 + random() * 0.1));
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" preserveAspectRatio="xMidYMid slice"><defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${palette.sky[0]}"/><stop offset="1" stop-color="${palette.sky[1]}"/></linearGradient><radialGradient id="vignette" cx="0.5" cy="0.45" r="0.75"><stop offset="0.55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="0.65"/></radialGradient><filter id="soft"><feGaussianBlur stdDeviation="${round(6 + random() * 8)}"/></filter><filter id="depth"><feGaussianBlur stdDeviation="${round(random() * 1.6)}"/></filter><filter id="grey"><feColorMatrix type="saturate" values="0"/></filter></defs><g${greyFilter}><g transform="rotate(${tilt} ${width / 2} ${height / 2})" opacity="${exposure}"><rect x="-40" y="-40" width="${width + 80}" height="${height + 80}" fill="url(#sky)"/>${bokehOf(palette, random, width, height)}${conesOf(palette, random, width, height)}<rect x="-40" y="${floorTop}" width="${width + 80}" height="${height}" fill="${palette.floor}"/><g filter="url(#depth)">${subjectOf(scene, palette, random, width, height)}</g>${confettiOf(palette, random, width, height)}</g><rect width="${width}" height="${height}" fill="url(#vignette)"/></g></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
};
