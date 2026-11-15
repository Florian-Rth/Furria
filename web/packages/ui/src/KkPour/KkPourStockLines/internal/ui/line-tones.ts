import type { CSSObject, Theme } from '@mui/material/styles';
import { applyScheme, schemeInk } from '../../../../internal/scheme-paint';
import { kkTokens } from '../../../../tokens';

const { light, dark } = kkTokens.color;

const LINE_INKS: readonly (readonly [string, string])[] = [
  [light.ink, dark.ink],
  [light.blue, dark.blue],
  [light.metal.bronze.mid, dark.metal.bronze.mid],
  [light.green, dark.green],
  [light.metal.silver.mid, dark.metal.silver.mid],
];

export const lineToneOf = (index: number): number => index % LINE_INKS.length;

export const lineTonesPaint = (theme: Theme): CSSObject =>
  Object.fromEntries(
    LINE_INKS.map(([lightInk, darkInk], tone) => [
      `& [data-line-tone="${tone}"]`,
      applyScheme(theme, schemeInk(lightInk, darkInk)),
    ]),
  );
