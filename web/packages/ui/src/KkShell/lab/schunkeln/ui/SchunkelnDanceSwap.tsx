import Box from '@mui/material/Box';
import { motion } from 'motion/react';
import type { CSSProperties, FC, ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { useSchunkeln } from '../logic/use-schunkeln';
import { SchunkelnFlight } from './SchunkelnFlight';
import { SchunkelnRestLetters } from './SchunkelnRestLetters';
import { SchunkelnRestSway } from './SchunkelnRestSway';

const STACKED = '1 / 1';

const TITLE_CELL_STYLE: CSSProperties = { gridArea: STACKED, minWidth: 0 };

interface SchunkelnDanceSwapProps {
  rest: ReactNode;
  title: ReactNode;
  restText: string | null;
  titleText: string;
}

export const SchunkelnDanceSwap: FC<SchunkelnDanceSwapProps> = ({
  rest,
  title,
  restText,
  titleText,
}) => {
  const { slotRef, restRef, flightRef, scene, titleOpacity, flightOpacity, restOpacity } =
    useSchunkeln(restText, titleText);

  const titleStyle = { ...TITLE_CELL_STYLE, opacity: titleOpacity };
  const restLine =
    restText === null ? (
      <SchunkelnRestSway rest={rest} scene={scene} />
    ) : (
      <SchunkelnRestLetters rest={rest} scene={scene} fallbackOpacity={restOpacity} />
    );
  const flight = createPortal(
    <SchunkelnFlight flightRef={flightRef} scene={scene} opacity={flightOpacity} />,
    document.body,
  );

  return (
    <Box data-kk-schunkeln-swap sx={{ display: 'grid', alignItems: 'center', minWidth: 0 }}>
      <Box ref={restRef} sx={{ gridArea: STACKED, position: 'relative', minWidth: 0 }}>
        {restLine}
      </Box>
      <motion.div ref={slotRef} style={titleStyle}>
        {title}
      </motion.div>
      {flight}
    </Box>
  );
};
