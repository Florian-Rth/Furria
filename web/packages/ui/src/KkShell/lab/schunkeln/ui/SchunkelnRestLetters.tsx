import Box from '@mui/material/Box';
import type { MotionValue } from 'motion/react';
import { motion } from 'motion/react';
import type { FC, ReactNode } from 'react';
import type { SchunkelScene } from '../logic/schunkel-values';
import { SchunkelnRestLetter } from './SchunkelnRestLetter';

interface SchunkelnRestLettersProps {
  rest: ReactNode;
  scene: SchunkelScene;
  fallbackOpacity: MotionValue<number>;
}

export const SchunkelnRestLetters: FC<SchunkelnRestLettersProps> = ({
  rest,
  scene,
  fallbackOpacity,
}) => {
  const { restGlyphs, restLetters } = scene;
  const measured = restGlyphs.length > 0 && restGlyphs.length === restLetters.length;

  const fallbackStyle = { opacity: fallbackOpacity };
  const letters = restLetters.map((values, index) => {
    const glyph = restGlyphs.at(index);

    return glyph === undefined ? null : (
      <SchunkelnRestLetter key={`${index}-${glyph.char}`} glyph={glyph} values={values} />
    );
  });

  if (!measured) {
    return <motion.div style={fallbackStyle}>{rest}</motion.div>;
  }

  return (
    <>
      <Box sx={{ opacity: 0 }}>{rest}</Box>
      <Box aria-hidden>{letters}</Box>
    </>
  );
};
