import Box from '@mui/material/Box';
import { motion } from 'motion/react';
import type { CSSProperties, FC, ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { ConfettiBarTitle } from './ConfettiBarTitle';
import { ConfettiBurst } from './ConfettiBurst';
import { ConfettiFlight } from './ConfettiFlight';
import { ConfettiGlassGlow } from './ConfettiGlassGlow';
import { useConfetti } from './use-confetti';

const STACKED = '1 / 1';

const CELL_STYLE: CSSProperties = { gridArea: STACKED, minWidth: 0 };

interface ConfettiFlightSwapProps {
  rest: ReactNode;
  titleText: string;
}

export const ConfettiFlightSwap: FC<ConfettiFlightSwapProps> = ({ rest, titleText }) => {
  const { slotRef, geometry, landingKey, values } = useConfetti();

  const restStyle = {
    ...CELL_STYLE,
    opacity: values.restOpacity,
    x: values.restX,
    y: values.restY,
  };
  const titleStyle = {
    ...CELL_STYLE,
    opacity: values.titleOpacity,
    scaleX: values.titleScaleX,
    scaleY: values.titleScaleY,
    originX: 0,
    originY: 1,
  };

  const headline = geometry?.headline ?? null;

  const overlay = createPortal(
    <>
      <ConfettiGlassGlow geometry={geometry} landingKey={landingKey} />
      <ConfettiFlight headline={headline} values={values} />
      <ConfettiBurst geometry={geometry} landingKey={landingKey} />
    </>,
    document.body,
  );

  return (
    <Box data-kk-dock-swap sx={{ display: 'grid', alignItems: 'center', minWidth: 0 }}>
      <motion.div style={restStyle}>{rest}</motion.div>
      <motion.div ref={slotRef} style={titleStyle}>
        <ConfettiBarTitle>{titleText}</ConfettiBarTitle>
      </motion.div>
      {overlay}
    </Box>
  );
};
