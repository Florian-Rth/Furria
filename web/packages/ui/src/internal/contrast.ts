export interface KkRgba {
  red: number;
  green: number;
  blue: number;
  alpha: number;
}

const HEX_RADIX = 16;
const CHANNEL_MAX = 255;
const SHORT_HEX_LENGTH = 3;
const SRGB_THRESHOLD = 0.04045;
const SRGB_DIVISOR = 12.92;
const SRGB_OFFSET = 0.055;
const SRGB_SCALE = 1.055;
const SRGB_EXPONENT = 2.4;
const LUMINANCE_RED = 0.2126;
const LUMINANCE_GREEN = 0.7152;
const LUMINANCE_BLUE = 0.0722;
const CONTRAST_OFFSET = 0.05;
const OPAQUE = 1;

const expandShortHex = (digits: string): string =>
  digits
    .split('')
    .map((digit) => `${digit}${digit}`)
    .join('');

const parseHex = (value: string): KkRgba | null => {
  const digits = value.slice(1);
  const full = digits.length === SHORT_HEX_LENGTH ? expandShortHex(digits) : digits;
  const channels = full.match(/../g);

  if (channels === null || channels.length < SHORT_HEX_LENGTH) {
    return null;
  }

  const [red, green, blue] = channels.map((channel) => Number.parseInt(channel, HEX_RADIX));

  if (red === undefined || green === undefined || blue === undefined) {
    return null;
  }

  return { red, green, blue, alpha: OPAQUE };
};

const parseRgbFunction = (value: string): KkRgba | null => {
  const inner = value.slice(value.indexOf('(') + 1, value.lastIndexOf(')'));
  const parts = inner.split(',').map((part) => Number.parseFloat(part.trim()));
  const [red, green, blue, alpha] = parts;

  if (red === undefined || green === undefined || blue === undefined) {
    return null;
  }

  return { red, green, blue, alpha: alpha ?? OPAQUE };
};

export const parseColor = (value: string): KkRgba | null => {
  const trimmed = value.trim();

  if (trimmed.startsWith('#')) {
    return parseHex(trimmed);
  }

  if (trimmed.startsWith('rgb')) {
    return parseRgbFunction(trimmed);
  }

  return null;
};

const NO_HUE = 0;
const HUE_SECTORS = 6;
const HUE_SECTOR_DEGREES = 60;
const GREEN_SECTOR = 2;
const BLUE_SECTOR = 4;

const hueSectorOf = (color: KkRgba, span: number): number => {
  const brightest = Math.max(color.red, color.green, color.blue);

  if (brightest === color.red) {
    return ((color.green - color.blue) / span + HUE_SECTORS) % HUE_SECTORS;
  }

  if (brightest === color.green) {
    return (color.blue - color.red) / span + GREEN_SECTOR;
  }

  return (color.red - color.green) / span + BLUE_SECTOR;
};

export const hueOf = (value: string): number => {
  const color = parseColor(value);

  if (color === null) {
    return NO_HUE;
  }

  const span =
    Math.max(color.red, color.green, color.blue) - Math.min(color.red, color.green, color.blue);

  if (span === 0) {
    return NO_HUE;
  }

  return hueSectorOf(color, span) * HUE_SECTOR_DEGREES;
};

export const compositeOver = (foreground: KkRgba, background: KkRgba): KkRgba => ({
  red: foreground.red * foreground.alpha + background.red * (OPAQUE - foreground.alpha),
  green: foreground.green * foreground.alpha + background.green * (OPAQUE - foreground.alpha),
  blue: foreground.blue * foreground.alpha + background.blue * (OPAQUE - foreground.alpha),
  alpha: OPAQUE,
});

const toLinear = (channel: number): number => {
  const normalized = channel / CHANNEL_MAX;

  if (normalized <= SRGB_THRESHOLD) {
    return normalized / SRGB_DIVISOR;
  }

  return ((normalized + SRGB_OFFSET) / SRGB_SCALE) ** SRGB_EXPONENT;
};

export const relativeLuminance = (color: KkRgba): number =>
  LUMINANCE_RED * toLinear(color.red) +
  LUMINANCE_GREEN * toLinear(color.green) +
  LUMINANCE_BLUE * toLinear(color.blue);

export const contrastRatio = (foreground: string, background: string): number => {
  const ground = parseColor(background);
  const ink = parseColor(foreground);

  if (ground === null || ink === null) {
    return 0;
  }

  const groundLuminance = relativeLuminance(ground);
  const inkLuminance = relativeLuminance(compositeOver(ink, ground));
  const lighter = Math.max(groundLuminance, inkLuminance);
  const darker = Math.min(groundLuminance, inkLuminance);

  return (lighter + CONTRAST_OFFSET) / (darker + CONTRAST_OFFSET);
};

export const washOver = (wash: string, amount: string, background: string): string => {
  const ground = parseColor(background);
  const ink = parseColor(wash);
  const share = Number.parseFloat(amount) / 100;

  if (ground === null || ink === null) {
    return background;
  }

  const blended = compositeOver({ ...ink, alpha: ink.alpha * share }, ground);

  return `rgb(${blended.red}, ${blended.green}, ${blended.blue})`;
};
