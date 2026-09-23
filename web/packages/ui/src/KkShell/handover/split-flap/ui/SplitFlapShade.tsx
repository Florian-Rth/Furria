import Box from '@mui/material/Box';
import type { CSSObject, Theme } from '@mui/material/styles';
import type { MotionValue } from 'motion/react';
import { motion } from 'motion/react';
import type { CSSProperties, FC } from 'react';
import { applyScheme, schemeFill } from '../../../../internal/scheme-paint';
import { kkTokens } from '../../../../tokens';
import { splitFlapTileBounds } from './split-flap-tile-bounds';

const { light, dark } = kkTokens.color;

const FILL_STYLE: CSSProperties = { position: 'absolute', inset: 0 };

const shadePaint = (theme: Theme): CSSObject => ({
  ...splitFlapTileBounds(theme),
  ...applyScheme(theme, schemeFill(light.bg, dark.bg)),
});

interface SplitFlapShadeProps {
  shade: MotionValue<number>;
}

export const SplitFlapShade: FC<SplitFlapShadeProps> = ({ shade }) => (
  <motion.span style={{ ...FILL_STYLE, opacity: shade }}>
    <Box component="span" sx={shadePaint} />
  </motion.span>
);
