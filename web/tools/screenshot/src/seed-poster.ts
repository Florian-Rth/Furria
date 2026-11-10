import { crc32, deflateSync } from 'node:zlib';

type Rgb = readonly [number, number, number];

export interface PosterPalette {
  readonly top: Rgb;
  readonly bottom: Rgb;
  readonly confetti: readonly Rgb[];
}

const WIDTH = 1600;
const HEIGHT = 800;
const CHANNELS = 3;
const CONFETTI_COUNT = 140;
const STRIPE_PERIOD = 160;
const STRIPE_SHADE = 0.07;
const PNG_SIGNATURE = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

interface Dot {
  readonly x: number;
  readonly y: number;
  readonly radius: number;
  readonly color: Rgb;
}

const chunkOf = (type: string, data: Buffer): Buffer => {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const typed = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const checksum = Buffer.alloc(4);
  checksum.writeUInt32BE(crc32(typed));
  return Buffer.concat([length, typed, checksum]);
};

const mix = (from: number, to: number, share: number): number =>
  Math.round(from + (to - from) * share);

const confettiOf = (palette: PosterPalette, seed: number): Dot[] => {
  let state = seed;
  const next = (): number => {
    state = (state * 1_103_515_245 + 12_345) % 2_147_483_648;
    return state / 2_147_483_648;
  };
  return Array.from({ length: CONFETTI_COUNT }, () => ({
    x: next() * WIDTH,
    y: next() * HEIGHT,
    radius: 6 + next() * 22,
    color: palette.confetti[Math.floor(next() * palette.confetti.length)] ?? palette.top,
  }));
};

const dotAt = (dots: readonly Dot[], x: number, y: number): Dot | undefined =>
  dots.find((dot) => (dot.x - x) ** 2 + (dot.y - y) ** 2 <= dot.radius ** 2);

export const posterPng = (palette: PosterPalette, seed: number): Buffer => {
  const dots = confettiOf(palette, seed);
  const rowBytes = WIDTH * CHANNELS + 1;
  const pixels = Buffer.alloc(rowBytes * HEIGHT);
  for (let y = 0; y < HEIGHT; y += 1) {
    const share = y / HEIGHT;
    const nearby = dots.filter((dot) => Math.abs(dot.y - y) <= dot.radius);
    for (let x = 0; x < WIDTH; x += 1) {
      const offset = y * rowBytes + 1 + x * CHANNELS;
      const isStripe = Math.floor((x + y) / STRIPE_PERIOD) % 2 === 0;
      const shade = isStripe ? 1 - STRIPE_SHADE : 1;
      const dot = dotAt(nearby, x, y);
      for (let channel = 0; channel < CHANNELS; channel += 1) {
        const base = mix(palette.top[channel] ?? 0, palette.bottom[channel] ?? 0, share) * shade;
        pixels[offset + channel] = Math.round(dot === undefined ? base : (dot.color[channel] ?? 0));
      }
    }
  }
  const header = Buffer.alloc(13);
  header.writeUInt32BE(WIDTH, 0);
  header.writeUInt32BE(HEIGHT, 4);
  header.writeUInt8(8, 8);
  header.writeUInt8(2, 9);
  return Buffer.concat([
    PNG_SIGNATURE,
    chunkOf('IHDR', header),
    chunkOf('IDAT', deflateSync(pixels)),
    chunkOf('IEND', Buffer.alloc(0)),
  ]);
};
