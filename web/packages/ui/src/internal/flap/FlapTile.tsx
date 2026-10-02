import Box from '@mui/material/Box';
import type { CSSObject, Theme } from '@mui/material/styles';
import { alpha } from '@mui/material/styles';
import type { MotionValue } from 'motion/react';
import { motion } from 'motion/react';
import type { CSSProperties, FC } from 'react';
import { kkTokens } from '../../tokens';
import { applyScheme, schemeFill } from '../scheme-paint';
import { tonePaint } from '../tone';
import { flapTileBounds } from './flap-tile-bounds';

export type FlapTileTone = 'ink' | 'gold';

const { light, dark } = kkTokens.color;
const { material } = kkTokens.shell;
const HINGE = kkTokens.line.hair / 2;
const GOLD_HINGE_SHARE = '34%';

const FILL_STYLE: CSSProperties = { position: 'absolute', inset: 0 };

const hingeOf = (ink: string): string =>
  `linear-gradient(to bottom, transparent calc(50% - ${HINGE}px), ${ink} calc(50% - ${HINGE}px), ${ink} calc(50% + ${HINGE}px), transparent calc(50% + ${HINGE}px))`;

const tilePaints: Record<FlapTileTone, (theme: Theme) => CSSObject> = {
  ink: (theme) => ({
    ...flapTileBounds(theme),
    ...applyScheme(theme, schemeFill(light.ink, dark.ink), {
      light: { backgroundImage: hingeOf(alpha(material.glint, 0.22)) },
      dark: { backgroundImage: hingeOf(alpha(material.shadowInk.dark, 0.34)) },
    }),
  }),
  gold: (theme) => ({
    ...flapTileBounds(theme),
    ...tonePaint(theme, 'gold'),
    backgroundImage: hingeOf(`color-mix(in srgb, currentColor ${GOLD_HINGE_SHARE}, transparent)`),
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
