import Box from '@mui/material/Box';
import type { MotionValue } from 'motion/react';
import { motion } from 'motion/react';
import type { FC, RefObject } from 'react';
import type { SchunkelScene } from '../logic/schunkel-values';
import { SchunkelnFlightLetter } from './SchunkelnFlightLetter';

interface SchunkelnFlightProps {
  flightRef: RefObject<HTMLDivElement | null>;
  scene: SchunkelScene;
  opacity: MotionValue<number>;
}

export const SchunkelnFlight: FC<SchunkelnFlightProps> = ({ flightRef, scene, opacity }) => {
  const { plan, letters } = scene;

  const flightStyle = { opacity };
  const row = letters.map((values, index) => {
    const letter = plan?.letters.at(index);

    return letter === undefined ? null : (
      <SchunkelnFlightLetter key={`${index}-${letter.upper}`} letter={letter} values={values} />
    );
  });

  return (
    <Box
      ref={flightRef}
      aria-hidden
      data-kk-schunkeln-flight
      data-flying="false"
      sx={(theme) => ({
        position: 'fixed',
        top: 0,
        left: 0,
        width: 0,
        height: 0,
        zIndex: theme.zIndex.appBar + 1,
        pointerEvents: 'none',
      })}
    >
      <motion.div style={flightStyle}>{row}</motion.div>
    </Box>
  );
};
