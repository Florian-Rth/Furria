import Box from '@mui/material/Box';
import { motion } from 'motion/react';
import type { CSSProperties, FC, ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { useSway } from '../logic/use-sway';
import { SwayFlight } from './SwayFlight';
import { SwayLetterLine } from './SwayLetterLine';
import { SwayRestSwing } from './SwayRestSwing';

const STACKED = '1 / 1';

const TITLE_CELL_STYLE: CSSProperties = { gridArea: STACKED, position: 'relative', minWidth: 0 };

interface SwayDanceSwapProps {
  rest: ReactNode;
  title: ReactNode;
  restText: string | null;
  titleText: string;
}

export const SwayDanceSwap: FC<SwayDanceSwapProps> = ({ rest, title, restText, titleText }) => {
  const { slotRef, restRef, flightRef, scene, titleOpacity, flightOpacity, restOpacity } = useSway(
    restText,
    titleText,
  );

  const titleStyle = { ...TITLE_CELL_STYLE, opacity: titleOpacity };
  const restLine =
    restText === null ? (
      <SwayRestSwing rest={rest} scene={scene} />
    ) : (
      <SwayLetterLine
        line={rest}
        glyphs={scene.restGlyphs}
        letters={scene.restLetters}
        fallbackOpacity={restOpacity}
      />
    );
  const titleLine =
    scene.plan === null ? (
      <SwayLetterLine line={title} glyphs={scene.arrivalGlyphs} letters={scene.arrivalLetters} />
    ) : (
      title
    );
  const flight = createPortal(
    <SwayFlight flightRef={flightRef} scene={scene} opacity={flightOpacity} />,
    document.body,
  );

  return (
    <Box data-kk-sway-swap sx={{ display: 'grid', alignItems: 'center', minWidth: 0 }}>
      <Box ref={restRef} sx={{ gridArea: STACKED, position: 'relative', minWidth: 0 }}>
        {restLine}
      </Box>
      <motion.div ref={slotRef} style={titleStyle}>
        {titleLine}
      </motion.div>
      {flight}
    </Box>
  );
};
