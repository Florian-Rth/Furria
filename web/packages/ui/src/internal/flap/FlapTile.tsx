import Box from '@mui/material/Box';
import type { CSSObject, Theme } from '@mui/material/styles';
import { alpha } from '@mui/material/styles';
import type { MotionValue } from 'motion/react';
import { motion } from 'motion/react';
import type { CSSProperties, FC } from 'react';
import { kkTokens } from '../../tokens';
import type { KkScheme } from '../scheme-paint';
import { applyScheme } from '../scheme-paint';
import { flapTileBounds } from './flap-tile-bounds';

export type FlapTileTone = 'ink' | 'gold';

const { light, dark } = kkTokens.color;
const { material } = kkTokens.shell;
const HINGE = kkTokens.line.hair / 2;
const TOP_LIGHT = 1;
const TOP_LIGHT_SHARE = 0.18;

const FILL_STYLE: CSSProperties = { position: 'absolute', inset: 0 };

const hingeOf = (ink: string): string =>
  `linear-gradient(to bottom, transparent calc(50% - ${HINGE}px), ${ink} calc(50% - ${HINGE}px), ${ink} calc(50% + ${HINGE}px), transparent calc(50% + ${HINGE}px))`;

const boardScheme = (lightFill: string, darkFill: string): KkScheme => ({
  light: {
    backgroundColor: lightFill,
    backgroundImage: hingeOf(light.bg),
    boxShadow: `inset 0 ${TOP_LIGHT}px 0 ${alpha(material.glint, TOP_LIGHT_SHARE)}`,
  },
  dark: {
    backgroundColor: darkFill,
    backgroundImage: hingeOf(dark.bg),
    boxShadow: `inset 0 ${TOP_LIGHT}px 0 ${alpha(material.glint, TOP_LIGHT_SHARE)}`,
  },
});

const tilePaints: Record<FlapTileTone, (theme: Theme) => CSSObject> = {
  ink: (theme) => ({
    ...flapTileBounds(theme),
    ...applyScheme(theme, boardScheme(light.ink, dark.ink)),
  }),
  gold: (theme) => ({
    ...flapTileBounds(theme),
    ...applyScheme(theme, boardScheme(light.gold, dark.gold)),
  }),
};

interface FlapTileProps {
  presence: MotionValue<number> | number;
  tone?: FlapTileTone;
}

export const FlapTile: FC<FlapTileProps> = ({ presence, tone = 'ink' }) => (
  <motion.span style={{ ...FILL_STYLE, opacity: presence }}>
    <Box component="span" sx={tilePaints[tone]} />
  </motion.span>
);
