import Box from '@mui/material/Box';
import type { MotionValue } from 'motion/react';
import { motion } from 'motion/react';
import type { FC, ReactNode } from 'react';
import type { SwayGlyph } from '../logic/sway-pose';
import type { SwayLineValues } from '../logic/sway-values';
import { SwayLineLetter } from './SwayLineLetter';

interface SwayLetterLineProps {
  line: ReactNode;
  glyphs: readonly SwayGlyph[];
  letters: readonly SwayLineValues[];
  fallbackOpacity?: MotionValue<number>;
}

export const SwayLetterLine: FC<SwayLetterLineProps> = ({
  line,
  glyphs,
  letters,
  fallbackOpacity,
}) => {
  const measured = glyphs.length > 0 && glyphs.length === letters.length;

  const fallbackStyle = { opacity: fallbackOpacity };
  const letterNodes = letters.map((values, index) => {
    const glyph = glyphs.at(index);

    return glyph === undefined ? null : (
      <SwayLineLetter key={`${index}-${glyph.char}`} glyph={glyph} values={values} />
    );
  });

  if (!measured && fallbackOpacity === undefined) {
    return line;
  }

  if (!measured) {
    return <motion.div style={fallbackStyle}>{line}</motion.div>;
  }

  return (
    <>
      <Box sx={{ opacity: 0 }}>{line}</Box>
      <Box aria-hidden>{letterNodes}</Box>
    </>
  );
};
