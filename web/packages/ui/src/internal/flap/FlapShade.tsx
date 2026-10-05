import Box from '@mui/material/Box';
import type { CSSObject, Theme } from '@mui/material/styles';
import type { MotionValue } from 'motion/react';
import { motion } from 'motion/react';
import type { CSSProperties, FC } from 'react';
import { kkTokens } from '../../tokens';
import { applyScheme, schemeFill } from '../scheme-paint';
import type { FlapTileFit } from './flap-tile-bounds';
import { flapTileBoundsOf } from './flap-tile-bounds';

const { light, dark } = kkTokens.color;

const FILL_STYLE: CSSProperties = { position: 'absolute', inset: 0 };

const shadePaintOf =
  (fit: FlapTileFit) =>
  (theme: Theme): CSSObject => ({
    ...flapTileBoundsOf(fit)(theme),
    ...applyScheme(theme, schemeFill(light.bg, dark.bg)),
  });

interface FlapShadeProps {
  shade: MotionValue<number>;
  fit?: FlapTileFit;
}

export const FlapShade: FC<FlapShadeProps> = ({ shade, fit = 'bleed' }) => (
  <motion.span style={{ ...FILL_STYLE, opacity: shade }}>
    <Box component="span" sx={shadePaintOf(fit)} />
  </motion.span>
);
