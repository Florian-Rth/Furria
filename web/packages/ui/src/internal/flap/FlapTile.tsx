import Box from '@mui/material/Box';
import type { CSSObject, Theme } from '@mui/material/styles';
import { alpha } from '@mui/material/styles';
import type { FC } from 'react';
import { kkTokens } from '../../tokens';
import type { KkScheme } from '../scheme-paint';
import { applyScheme } from '../scheme-paint';
import type { FlapTileFit } from './flap-tile-bounds';
import { flapHingeShiftOf, flapTileBoundsOf } from './flap-tile-bounds';

export type FlapTileTone = 'ink' | 'gold';

const { light, dark } = kkTokens.color;
const { material } = kkTokens.shell;
const HINGE = kkTokens.line.hair / 2;
const TOP_LIGHT = 1;
const TOP_LIGHT_SHARE = 0.18;

const SEAM = 1;

const hingeOf = (ink: string, shift: string): string =>
  `linear-gradient(to bottom, transparent calc(50% + ${shift} - ${HINGE}px), ${ink} calc(50% + ${shift} - ${HINGE}px), ${ink} calc(50% + ${shift} + ${HINGE}px), transparent calc(50% + ${shift} + ${HINGE}px))`;

const GLINT = `inset 0 ${TOP_LIGHT}px 0 ${alpha(material.glint, TOP_LIGHT_SHARE)}`;

const shadowOf = (ground: string, fit: FlapTileFit): string =>
  fit === 'line' ? `${GLINT}, 0 0 0 ${SEAM}px ${ground}` : GLINT;

const boardScheme = (
  lightFill: string,
  darkFill: string,
  shift: string,
  fit: FlapTileFit,
): KkScheme => ({
  light: {
    backgroundColor: lightFill,
    backgroundImage: hingeOf(light.bg, shift),
    boxShadow: shadowOf(light.bg, fit),
  },
  dark: {
    backgroundColor: darkFill,
    backgroundImage: hingeOf(dark.bg, shift),
    boxShadow: shadowOf(dark.bg, fit),
  },
});

const tileFills: Record<FlapTileTone, [string, string]> = {
  ink: [light.ink, dark.ink],
  gold: [light.gold, dark.gold],
};

const tilePaintOf =
  (tone: FlapTileTone, fit: FlapTileFit) =>
  (theme: Theme): CSSObject => {
    const [lightFill, darkFill] = tileFills[tone];

    return {
      ...flapTileBoundsOf(fit)(theme),
      ...applyScheme(theme, boardScheme(lightFill, darkFill, flapHingeShiftOf(theme, fit), fit)),
    };
  };

interface FlapTileProps {
  tone?: FlapTileTone;
  fit?: FlapTileFit;
}

export const FlapTile: FC<FlapTileProps> = ({ tone = 'ink', fit = 'bleed' }) => (
  <Box component="span" sx={tilePaintOf(tone, fit)} />
);
