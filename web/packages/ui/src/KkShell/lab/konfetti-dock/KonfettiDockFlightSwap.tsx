import Box from '@mui/material/Box';
import { motion } from 'motion/react';
import type { CSSProperties, FC, ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { KonfettiDockBarTitle } from './KonfettiDockBarTitle';
import { KonfettiDockBurst } from './KonfettiDockBurst';
import { KonfettiDockFlight } from './KonfettiDockFlight';
import { KonfettiDockGlassGlow } from './KonfettiDockGlassGlow';
import { useKonfettiDock } from './use-konfetti-dock';

const STACKED = '1 / 1';

const CELL_STYLE: CSSProperties = { gridArea: STACKED, minWidth: 0 };

interface KonfettiDockFlightSwapProps {
  rest: ReactNode;
  titleText: string;
}

export const KonfettiDockFlightSwap: FC<KonfettiDockFlightSwapProps> = ({ rest, titleText }) => {
  const { slotRef, geometry, landingKey, values } = useKonfettiDock();

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

  const overlay = createPortal(
    <>
      <KonfettiDockGlassGlow geometry={geometry} landingKey={landingKey} />
      <KonfettiDockFlight geometry={geometry} values={values} />
      <KonfettiDockBurst geometry={geometry} landingKey={landingKey} />
    </>,
    document.body,
  );

  return (
    <Box data-kk-dock-swap sx={{ display: 'grid', alignItems: 'center', minWidth: 0 }}>
      <motion.div style={restStyle}>{rest}</motion.div>
      <motion.div ref={slotRef} style={titleStyle}>
        <KonfettiDockBarTitle>{titleText}</KonfettiDockBarTitle>
      </motion.div>
      {overlay}
    </Box>
  );
};
