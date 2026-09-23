import Box from '@mui/material/Box';
import { motion } from 'motion/react';
import type { FC } from 'react';
import type { DockGeometry } from './dock-flight';
import { KonfettiDockHeadline } from './KonfettiDockHeadline';
import type { DockValues } from './use-dock-values';

interface KonfettiDockFlightProps {
  geometry: DockGeometry | null;
  values: DockValues;
}

export const KonfettiDockFlight: FC<KonfettiDockFlightProps> = ({ geometry, values }) => {
  if (geometry === null) {
    return null;
  }

  const { headline } = geometry;

  const headlineStyle = {
    position: 'absolute' as const,
    left: headline.left,
    top: headline.top,
    width: headline.width,
    opacity: values.flightOpacity,
    x: values.headlineX,
    y: values.headlineY,
    scale: values.headlineScale,
    originX: 0,
    originY: 0,
  };

  return (
    <Box
      aria-hidden
      data-kk-dock-flight
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
      <motion.div style={headlineStyle}>
        <KonfettiDockHeadline>{geometry.headlineText}</KonfettiDockHeadline>
      </motion.div>
    </Box>
  );
};
