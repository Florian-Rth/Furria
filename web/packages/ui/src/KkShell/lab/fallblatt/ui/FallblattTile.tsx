import Box from '@mui/material/Box';
import type { CSSObject, Theme } from '@mui/material/styles';
import { alpha } from '@mui/material/styles';
import type { MotionValue } from 'motion/react';
import { motion } from 'motion/react';
import type { CSSProperties, FC } from 'react';
import { applyScheme, schemeFill } from '../../../../internal/scheme-paint';
import { kkTokens } from '../../../../tokens';
import { fallblattTileBounds } from './fallblatt-tile-bounds';

const { light, dark } = kkTokens.color;
const { material } = kkTokens.shell;
const HINGE = kkTokens.line.hair / 2;

const FILL_STYLE: CSSProperties = { position: 'absolute', inset: 0 };

const hingeOf = (ink: string): string =>
  `linear-gradient(to bottom, transparent calc(50% - ${HINGE}px), ${ink} calc(50% - ${HINGE}px), ${ink} calc(50% + ${HINGE}px), transparent calc(50% + ${HINGE}px))`;

const tilePaint = (theme: Theme): CSSObject => ({
  ...fallblattTileBounds(theme),
  ...applyScheme(theme, schemeFill(light.ink, dark.ink), {
    light: { backgroundImage: hingeOf(alpha(material.glint, 0.22)) },
    dark: { backgroundImage: hingeOf(alpha(material.shadowInk.dark, 0.34)) },
  }),
});

interface FallblattTileProps {
  presence: MotionValue<number> | number;
}

export const FallblattTile: FC<FallblattTileProps> = ({ presence }) => (
  <motion.span style={{ ...FILL_STYLE, opacity: presence }}>
    <Box component="span" sx={tilePaint} />
  </motion.span>
);
