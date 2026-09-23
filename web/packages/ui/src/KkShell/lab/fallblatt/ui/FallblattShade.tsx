import Box from '@mui/material/Box';
import type { CSSObject, Theme } from '@mui/material/styles';
import type { MotionValue } from 'motion/react';
import { motion } from 'motion/react';
import type { CSSProperties, FC } from 'react';
import { applyScheme, schemeFill } from '../../../../internal/scheme-paint';
import { kkTokens } from '../../../../tokens';
import { fallblattTileBounds } from './fallblatt-tile-bounds';

const { light, dark } = kkTokens.color;

const FILL_STYLE: CSSProperties = { position: 'absolute', inset: 0 };

const shadePaint = (theme: Theme): CSSObject => ({
  ...fallblattTileBounds(theme),
  ...applyScheme(theme, schemeFill(light.bg, dark.bg)),
});

interface FallblattShadeProps {
  shade: MotionValue<number>;
}

export const FallblattShade: FC<FallblattShadeProps> = ({ shade }) => (
  <motion.span style={{ ...FILL_STYLE, opacity: shade }}>
    <Box component="span" sx={shadePaint} />
  </motion.span>
);
