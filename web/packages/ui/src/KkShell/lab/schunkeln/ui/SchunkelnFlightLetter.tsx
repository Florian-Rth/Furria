import { motion, useTransform } from 'motion/react';
import type { FC } from 'react';
import type { SchunkelLetterPlan } from '../logic/schunkel-pose';
import { LETTER_ORIGIN_X, LETTER_ORIGIN_Y } from '../logic/schunkel-pose';
import type { SchunkelLetterValues } from '../logic/schunkel-values';
import { SchunkelnGlyph } from './SchunkelnGlyph';

const upperMixOf = (lower: number): number => 1 - lower;

interface SchunkelnFlightLetterProps {
  letter: SchunkelLetterPlan;
  values: SchunkelLetterValues;
}

export const SchunkelnFlightLetter: FC<SchunkelnFlightLetterProps> = ({ letter, values }) => {
  const upperMix = useTransform(values.lower, upperMixOf);

  const letterStyle = {
    position: 'absolute' as const,
    left: 0,
    top: 0,
    width: letter.width,
    height: letter.height,
    x: values.x,
    y: values.y,
    scale: values.scale,
    scaleY: values.squash,
    rotate: values.rotate,
    originX: LETTER_ORIGIN_X,
    originY: LETTER_ORIGIN_Y,
    opacity: values.presence,
  };

  return (
    <motion.span style={letterStyle}>
      <SchunkelnGlyph letterCase="uppercase" height={letter.height} opacity={upperMix}>
        {letter.upper}
      </SchunkelnGlyph>
      <SchunkelnGlyph letterCase="none" height={letter.height} opacity={values.lower}>
        {letter.lower}
      </SchunkelnGlyph>
    </motion.span>
  );
};
