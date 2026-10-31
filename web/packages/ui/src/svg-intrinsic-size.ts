import type { KkSize } from './image-aspect';
import { svgAttributeOf, svgRootTagOf } from './internal/svg-root';

const LENGTH = /^\s*(\d*\.?\d+(?:e[+-]?\d+)?)\s*(px|pt|pc|mm|cm|in)?\s*$/i;
const VIEW_BOX_SEPARATOR = /[\s,]+/;
const VIEW_BOX_TERMS = 4;

const PIXELS_PER_UNIT: Record<string, number> = {
  px: 1,
  pt: 96 / 72,
  pc: 16,
  mm: 96 / 25.4,
  cm: 96 / 2.54,
  in: 96,
};

const toSize = (width: number, height: number): KkSize | null =>
  Number.isFinite(width) && Number.isFinite(height) && width > 0 && height > 0
    ? { width, height }
    : null;

const viewBoxSizeOf = (viewBox: string | null): KkSize | null => {
  const terms = viewBox?.trim().split(VIEW_BOX_SEPARATOR).map(Number) ?? [];

  if (terms.length !== VIEW_BOX_TERMS) {
    return null;
  }

  return toSize(terms[2] ?? Number.NaN, terms[3] ?? Number.NaN);
};

const pixelsOf = (length: string | null): number => {
  const match = length === null ? null : LENGTH.exec(length);

  if (match === null) {
    return Number.NaN;
  }

  const unit = (match[2] ?? 'px').toLowerCase();

  return Number(match[1]) * (PIXELS_PER_UNIT[unit] ?? Number.NaN);
};

export const svgIntrinsicSizeOf = (markup: string): KkSize | null => {
  const root = svgRootTagOf(markup);

  if (root === null) {
    return null;
  }

  return (
    viewBoxSizeOf(svgAttributeOf(root.tag, 'viewBox')) ??
    toSize(
      pixelsOf(svgAttributeOf(root.tag, 'width')),
      pixelsOf(svgAttributeOf(root.tag, 'height')),
    )
  );
};
