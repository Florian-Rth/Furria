import Typography from '@mui/material/Typography';
import type { MotionValue } from 'motion/react';
import { motion } from 'motion/react';
import type { CSSProperties, FC, PropsWithChildren } from 'react';
import { kkTokens } from '../../../../tokens';

export type SwayGlyphCase = 'uppercase' | 'none';

const GLYPH_STYLE: CSSProperties = { position: 'absolute', left: 0, top: 0 };

interface SwayGlyphProps extends PropsWithChildren {
  letterCase: SwayGlyphCase;
  height: number;
  opacity: MotionValue<number>;
}

export const SwayGlyph: FC<SwayGlyphProps> = ({ letterCase, height, opacity, children }) => {
  const glyphStyle = { ...GLYPH_STYLE, opacity };

  return (
    <motion.span style={glyphStyle}>
      <Typography
        component="span"
        sx={{
          display: 'block',
          typography: 'h1',
          lineHeight: `${height}px`,
          letterSpacing: kkTokens.type.tracking.display,
          color: 'text.primary',
          textTransform: letterCase,
          whiteSpace: 'pre',
        }}
      >
        {children}
      </Typography>
    </motion.span>
  );
};
