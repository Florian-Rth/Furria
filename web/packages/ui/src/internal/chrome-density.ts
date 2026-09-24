import { kkTokens } from '../tokens';

export type KkChromeMotion = 'ramped' | 'instant';

export interface KkChromeInkOpacity {
  tint: string;
  hairline: string;
  shadow: string;
  glint: string;
  sheen: string;
  rim: string;
}

export interface KkChromeMaterial {
  blurRadius: string;
  saturation: string;
  shadowOffsetY: string;
  shadowBlur: string;
  light: KkChromeInkOpacity;
  dark: KkChromeInkOpacity;
}

interface KkChromeInkEnds {
  rest: Record<keyof KkChromeInkOpacity, number>;
  dense: Record<keyof KkChromeInkOpacity, number>;
}

const { material, scrollTravel } = kkTokens.shell;

export const CHROME_DENSITY_PROPERTY = '--kk-chrome-density';

const DENSITY = `var(${CHROME_DENSITY_PROPERTY}, 0)`;

export const densityBetween = (rest: number, dense: number): string =>
  `calc(${rest} + ${dense - rest} * ${DENSITY})`;

const inkOpacityOf = (ends: KkChromeInkEnds): KkChromeInkOpacity => ({
  tint: densityBetween(ends.rest.tint, ends.dense.tint),
  hairline: densityBetween(ends.rest.hairline, ends.dense.hairline),
  shadow: densityBetween(ends.rest.shadow, ends.dense.shadow),
  glint: densityBetween(ends.rest.glint, ends.dense.glint),
  sheen: densityBetween(ends.rest.sheen, ends.dense.sheen),
  rim: densityBetween(ends.rest.rim, ends.dense.rim),
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

export const CHROME_MATERIAL: KkChromeMaterial = {
  blurRadius: densityBetween(material.blur.rest, material.blur.dense),
  saturation: densityBetween(material.saturation.rest, material.saturation.dense),
  shadowOffsetY: densityBetween(material.shadowOffsetY.rest, material.shadowOffsetY.dense),
  shadowBlur: densityBetween(material.shadowBlur.rest, material.shadowBlur.dense),
  light: inkOpacityOf(material.light),
  dark: inkOpacityOf(material.dark),
};
