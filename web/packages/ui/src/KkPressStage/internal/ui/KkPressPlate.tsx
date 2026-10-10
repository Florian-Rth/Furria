import Box from '@mui/material/Box';
import type { CSSObject, Theme } from '@mui/material/styles';
import type { TargetAndTransition } from 'motion/react';
import { motion } from 'motion/react';
import type { FC } from 'react';
import { kkTokens } from '../../../tokens';
import type { PlateSpec } from '../logic/press-motion';
import { plateInkOf, plateStartOf } from '../logic/press-motion';

const platePaint =
  (plate: PlateSpec) =>
  (theme: Theme): CSSObject => {
    const ink = plateInkOf(theme, plate.ink);
    return {
      position: 'absolute',
      inset: 0,
      borderRadius: `${kkTokens.radius.base}px`,
      border: `${kkTokens.line.section}px solid ${ink}`,
    };
  };

interface KkPressPlateProps {
  plate: PlateSpec;
  target: TargetAndTransition;
  wobble: TargetAndTransition;
}

export const KkPressPlate: FC<KkPressPlateProps> = ({ plate, target, wobble }) => (
  <Box
    component={motion.div}
    initial={plateStartOf(plate)}
    animate={target}
    sx={{ position: 'absolute', inset: 0 }}
  >
    <Box component={motion.div} animate={wobble} sx={platePaint(plate)} />
  </Box>
);
