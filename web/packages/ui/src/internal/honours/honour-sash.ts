export type SashMode = 'band' | 'icon' | 'text';

export interface SashRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface SashIcon {
  x: number;
  y: number;
  size: number;
}

export interface SashText {
  x: number;
  baseline: number;
  size: number;
}

export interface SashLayout {
  band: SashRect;
  edges: SashRect[];
  icon: SashIcon | null;
  text: SashText | null;
}

const BAND_DROP = 0.36;
const BAND_HEIGHT: Record<SashMode, number> = { band: 0.5, icon: 0.4, text: 0.4 };
const BAND_REACH = 2.6;
const ICON_SIZE: Record<SashMode, number> = { band: 0, icon: 0.34, text: 0.28 };
const TEXT_CAP = 0.25;
const TEXT_ROOM = 1.3;
const GLYPH_WIDTH = 0.47;
const GLYPH_TRACKING = 0.03;
const TEXT_GAP = 0.35;
const BASELINE_SHIFT = 0.37;
const EDGE_SHARE = 0.07;
const EDGE_MIN = 0.6;
const UPPER_EDGE_OFFSET = 1.2;
const LOWER_EDGE_OFFSET = 2.2;

const rounded = (value: number): number => Number(value.toFixed(2)) + 0;

const textSizeOf = (radius: number, iconSize: number, letters: number): number =>
  Math.min(
    radius * TEXT_CAP,
    (radius * TEXT_ROOM - iconSize) / (letters * (GLYPH_WIDTH + GLYPH_TRACKING) + TEXT_GAP),
  );

export const sashLayoutOf = (
  center: number,
  radius: number,
  mode: SashMode,
  letters: number,
): SashLayout => {
  const height = radius * BAND_HEIGHT[mode];
  const top = center + radius * BAND_DROP;
  const middle = top + height / 2;
  const width = radius * BAND_REACH;
  const left = center - width / 2;
  const edge = Math.max(EDGE_MIN, height * EDGE_SHARE);
  const iconSize = radius * ICON_SIZE[mode];
  const textSize = mode === 'text' && letters > 0 ? textSizeOf(radius, iconSize, letters) : 0;
  const textWidth = letters * textSize * (GLYPH_WIDTH + GLYPH_TRACKING);
  const gap = textSize * TEXT_GAP;
  const total = iconSize + (textSize > 0 ? gap + textWidth : 0);
  const start = center - total / 2;

  return {
    band: { x: rounded(left), y: rounded(top), width: rounded(width), height: rounded(height) },
    edges: [top + edge * UPPER_EDGE_OFFSET, top + height - edge * LOWER_EDGE_OFFSET].map((y) => ({
      x: rounded(left),
      y: rounded(y),
      width: rounded(width),
      height: rounded(edge),
    })),
    icon:
      mode === 'band'
        ? null
        : { x: rounded(start), y: rounded(middle - iconSize / 2), size: rounded(iconSize) },
    text:
      textSize > 0
        ? {
            x: rounded(start + iconSize + gap),
            baseline: rounded(middle + textSize * BASELINE_SHIFT),
            size: rounded(textSize),
          }
        : null,
  };
};
