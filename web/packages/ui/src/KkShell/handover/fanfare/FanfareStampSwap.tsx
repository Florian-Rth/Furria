import Box from '@mui/material/Box';
import { motion } from 'motion/react';
import type { CSSProperties, FC, ReactNode } from 'react';
import { FanfareBarTitle } from './FanfareBarTitle';
import { FanfareGlassRing } from './FanfareGlassRing';
import { FanfareStampCopy } from './FanfareStampCopy';
import { useFanfareStamp } from './use-fanfare-stamp';

const CELL_STYLE: CSSProperties = { gridArea: '1 / 1', minWidth: 0 };

interface FanfareStampSwapProps {
  rest: ReactNode;
  titleText: string;
}

export const FanfareStampSwap: FC<FanfareStampSwapProps> = ({ rest, titleText }) => {
  const { slotRef, copyRef, chrome, staging, values } = useFanfareStamp();

  const restStyle = {
    ...CELL_STYLE,
    opacity: values.restOpacity,
    x: values.restX,
    y: values.restY,
    rotate: values.restRotate,
    scale: values.restScale,
    originX: 0,
    originY: 1,
  };
  const titleStyle = {
    ...CELL_STYLE,
    opacity: values.titleOpacity,
    scale: values.titleScale,
    originX: 0,
    originY: 0.5,
  };
  const ringX = staging?.ringX ?? 0;

  return (
    <Box data-fanfare-swap sx={{ display: 'grid', alignItems: 'center', minWidth: 0 }}>
      <motion.div style={restStyle}>{rest}</motion.div>
      <motion.div ref={slotRef} style={titleStyle}>
        <FanfareBarTitle text={titleText} values={values} />
      </motion.div>
      <FanfareStampCopy copyRef={copyRef} staging={staging} titleText={titleText} values={values} />
      <FanfareGlassRing host={chrome} ringX={ringX} glow={values.glow} />
    </Box>
  );
};
