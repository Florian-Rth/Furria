import Box from '@mui/material/Box';
import type { CSSObject, Theme } from '@mui/material/styles';
import type { MotionValue } from 'motion/react';
import { motion } from 'motion/react';
import type { CSSProperties, FC } from 'react';
import { kkTokens } from '../../tokens';
import { applyScheme, schemeFill } from '../scheme-paint';
import { flapTileBounds } from './flap-tile-bounds';

const { light, dark } = kkTokens.color;

const FILL_STYLE: CSSProperties = { position: 'absolute', inset: 0 };

const shadePaint = (theme: Theme): CSSObject => ({
  ...flapTileBounds(theme),
  ...applyScheme(theme, schemeFill(light.bg, dark.bg)),
});

interface FlapShadeProps {
  shade: MotionValue<number>;
}

export const FlapShade: FC<FlapShadeProps> = ({ shade }) => (
  <motion.span style={{ ...FILL_STYLE, opacity: shade }}>
    <Box component="span" sx={shadePaint} />
  </motion.span>
);
