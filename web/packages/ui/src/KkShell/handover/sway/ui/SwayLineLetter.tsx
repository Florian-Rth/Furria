import Typography from '@mui/material/Typography';
import { motion } from 'motion/react';
import type { FC } from 'react';
import { kkTokens } from '../../../../tokens';
import type { SwayGlyph } from '../logic/sway-pose';
import { LETTER_ORIGIN_X, LETTER_ORIGIN_Y } from '../logic/sway-pose';
import type { SwayLineValues } from '../logic/sway-values';

interface SwayLineLetterProps {
  glyph: SwayGlyph;
  values: SwayLineValues;
}

export const SwayLineLetter: FC<SwayLineLetterProps> = ({ glyph, values }) => {
  const letterStyle = {
    position: 'absolute' as const,
    left: glyph.left,
    top: glyph.top,
    width: glyph.width,
    height: glyph.height,
    x: values.x,
    rotate: values.rotate,
    opacity: values.opacity,
    originX: LETTER_ORIGIN_X,
    originY: LETTER_ORIGIN_Y,
  };

  return (
    <motion.span style={letterStyle}>
      <Typography
        component="span"
        sx={{
          display: 'block',
          typography: 'h4',
          lineHeight: `${glyph.height}px`,
          letterSpacing: kkTokens.type.tracking.display,
          color: 'text.primary',
          whiteSpace: 'pre',
        }}
      >
        {glyph.char}
      </Typography>
    </motion.span>
  );
};
