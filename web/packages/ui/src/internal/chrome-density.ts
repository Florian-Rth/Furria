import { kkTokens } from '../tokens';

export type KkChromeMotion = 'ramped' | 'instant';

export interface KkChromeInkOpacity {
  tint: number;
  hairline: number;
  shadow: number;
  glint: number;
  sheen: number;
  rim: number;
}

export interface KkChromeMaterial {
  blurRadius: number;
  saturation: number;
  shadowOffsetY: number;
  shadowBlur: number;
  light: KkChromeInkOpacity;
  dark: KkChromeInkOpacity;
}

interface KkChromeInkEnds {
  rest: KkChromeInkOpacity;
  dense: KkChromeInkOpacity;
}

const { material, scrollTravel } = kkTokens.shell;

const between = (rest: number, dense: number, density: number): number =>
  rest + (dense - rest) * density;

const inkOpacityAt = (ends: KkChromeInkEnds, density: number): KkChromeInkOpacity => ({
  tint: between(ends.rest.tint, ends.dense.tint, density),
  hairline: between(ends.rest.hairline, ends.dense.hairline, density),
  shadow: between(ends.rest.shadow, ends.dense.shadow, density),
  glint: between(ends.rest.glint, ends.dense.glint, density),
  sheen: between(ends.rest.sheen, ends.dense.sheen, density),
  rim: between(ends.rest.rim, ends.dense.rim, density),
});

export const chromeDensityAt = (
  scrollOffset: number,
  motion: KkChromeMotion = 'ramped',
): number => {
  if (scrollOffset <= 0) {
    return 0;
  }

  if (motion === 'instant') {
    return 1;
  }

  return Math.min(scrollOffset / scrollTravel, 1);
};

export const chromeMaterialAt = (density: number): KkChromeMaterial => ({
  blurRadius: between(material.blur.rest, material.blur.dense, density),
  saturation: between(material.saturation.rest, material.saturation.dense, density),
  shadowOffsetY: between(material.shadowOffsetY.rest, material.shadowOffsetY.dense, density),
  shadowBlur: between(material.shadowBlur.rest, material.shadowBlur.dense, density),
  light: inkOpacityAt(material.light, density),
  dark: inkOpacityAt(material.dark, density),
});
