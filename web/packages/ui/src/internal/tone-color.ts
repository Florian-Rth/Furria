export interface KkRgb {
  r: number;
  g: number;
  b: number;
}

export interface KkOklch {
  l: number;
  c: number;
  h: number;
}

export interface KkHsv {
  h: number;
  s: number;
  v: number;
}

export const TONE_HEX_PATTERN = /^#[0-9A-F]{6}$/i;
const SEARCH_STEPS = 24;
const GAMUT_EPSILON = 1e-4;
const FULL_TURN = 360;
const HUE_SECTOR = 60;

export const isToneHex = (value: string): boolean => TONE_HEX_PATTERN.test(value);

export const toToneHex = (value: string): string | null => {
  const trimmed = value.trim();
  const prefixed = trimmed.startsWith('#') ? trimmed : `#${trimmed}`;

  return isToneHex(prefixed) ? prefixed.toUpperCase() : null;
};

const clamp01 = (value: number): number => Math.min(1, Math.max(0, value));

export const rgbOfHex = (hex: string): KkRgb => ({
  r: Number.parseInt(hex.slice(1, 3), 16) / 255,
  g: Number.parseInt(hex.slice(3, 5), 16) / 255,
  b: Number.parseInt(hex.slice(5, 7), 16) / 255,
});

const channelHex = (channel: number): string =>
  Math.round(clamp01(channel) * 255)
    .toString(16)
    .padStart(2, '0')
    .toUpperCase();

export const hexOfRgb = (rgb: KkRgb): string =>
  `#${channelHex(rgb.r)}${channelHex(rgb.g)}${channelHex(rgb.b)}`;

const toLinear = (channel: number): number =>
  channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;

const fromLinear = (channel: number): number =>
  channel <= 0.0031308 ? channel * 12.92 : 1.055 * channel ** (1 / 2.4) - 0.055;

const linearOf = (rgb: KkRgb): KkRgb => ({
  r: toLinear(rgb.r),
  g: toLinear(rgb.g),
  b: toLinear(rgb.b),
});

export const luminanceOf = (hex: string): number => {
  const linear = linearOf(rgbOfHex(hex));

  return 0.2126 * linear.r + 0.7152 * linear.g + 0.0722 * linear.b;
};

const contrastOfLuminances = (first: number, second: number): number =>
  (Math.max(first, second) + 0.05) / (Math.min(first, second) + 0.05);

export const contrastOf = (first: string, second: string): number =>
  contrastOfLuminances(luminanceOf(first), luminanceOf(second));

export const oklchOf = (hex: string): KkOklch => {
  const { r, g, b } = linearOf(rgbOfHex(hex));
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  const lightness = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const a = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const bAxis = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  const hue = (Math.atan2(bAxis, a) * 180) / Math.PI;

  return { l: lightness, c: Math.hypot(a, bAxis), h: (hue + FULL_TURN) % FULL_TURN };
};

const linearOfOklch = (color: KkOklch): KkRgb => {
  const hue = (color.h * Math.PI) / 180;
  const a = color.c * Math.cos(hue);
  const bAxis = color.c * Math.sin(hue);
  const l = (color.l + 0.3963377774 * a + 0.2158037573 * bAxis) ** 3;
  const m = (color.l - 0.1055613458 * a - 0.0638541728 * bAxis) ** 3;
  const s = (color.l - 0.0894841775 * a - 1.291485548 * bAxis) ** 3;

  return {
    r: 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    g: -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    b: -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  };
};

const isInGamut = (linear: KkRgb): boolean =>
  [linear.r, linear.g, linear.b].every(
    (channel) => channel >= -GAMUT_EPSILON && channel <= 1 + GAMUT_EPSILON,
  );

const intoGamut = (color: KkOklch): KkOklch => {
  if (isInGamut(linearOfOklch(color))) {
    return color;
  }

  let low = 0;
  let high = color.c;
  for (let step = 0; step < SEARCH_STEPS; step++) {
    const middle = (low + high) / 2;
    if (isInGamut(linearOfOklch({ ...color, c: middle }))) {
      low = middle;
    } else {
      high = middle;
    }
  }

  return { ...color, c: low };
};

export const hexOfOklch = (color: KkOklch): string => {
  const linear = linearOfOklch(intoGamut({ ...color, l: clamp01(color.l) }));

  return hexOfRgb({
    r: fromLinear(clamp01(linear.r)),
    g: fromLinear(clamp01(linear.g)),
    b: fromLinear(clamp01(linear.b)),
  });
};

export type KkShadeDirection = 'darker' | 'lighter';

export interface KkContrastFloor {
  against: string;
  ratio: number;
  direction: KkShadeDirection;
}

const meetsFloor = (color: KkOklch, floor: KkContrastFloor): boolean =>
  contrastOf(hexOfOklch(color), floor.against) >= floor.ratio;

export const shadeForContrast = (color: KkOklch, floor: KkContrastFloor): string => {
  if (meetsFloor(color, floor)) {
    return hexOfOklch(color);
  }

  const darker = floor.direction === 'darker';
  let passing = darker ? 0 : 1;
  let failing = color.l;
  for (let step = 0; step < SEARCH_STEPS; step++) {
    const middle = (passing + failing) / 2;
    if (meetsFloor({ ...color, l: middle }, floor)) {
      passing = middle;
    } else {
      failing = middle;
    }
  }

  return hexOfOklch({ ...color, l: passing });
};

export const toneDistance = (first: string, second: string): number => {
  const a = oklchOf(first);
  const b = oklchOf(second);
  const hueA = (a.h * Math.PI) / 180;
  const hueB = (b.h * Math.PI) / 180;

  return Math.hypot(
    a.l - b.l,
    a.c * Math.cos(hueA) - b.c * Math.cos(hueB),
    a.c * Math.sin(hueA) - b.c * Math.sin(hueB),
  );
};

export const hsvOfHex = (hex: string): KkHsv => {
  const { r, g, b } = rgbOfHex(hex);
  const max = Math.max(r, g, b);
  const spread = max - Math.min(r, g, b);
  const saturation = max === 0 ? 0 : spread / max;

  if (spread === 0) {
    return { h: 0, s: saturation, v: max };
  }

  const sector =
    max === r ? (g - b) / spread : max === g ? (b - r) / spread + 2 : (r - g) / spread + 4;

  return { h: (sector * HUE_SECTOR + FULL_TURN) % FULL_TURN, s: saturation, v: max };
};

const hsvChannel = (hsv: KkHsv, offset: number): number => {
  const k = (offset + hsv.h / HUE_SECTOR) % 6;

  return hsv.v - hsv.v * hsv.s * Math.max(0, Math.min(k, 4 - k, 1));
};

export const hexOfHsv = (hsv: KkHsv): string =>
  hexOfRgb({ r: hsvChannel(hsv, 5), g: hsvChannel(hsv, 3), b: hsvChannel(hsv, 1) });
