import Box from '@mui/material/Box';
import { motion } from 'motion/react';
import type { FC } from 'react';
import { ConfettiHeadline } from './ConfettiHeadline';
import type { DockHeadline } from './dock-flight';
import type { DockValues } from './use-dock-values';

interface ConfettiFlightProps {
  headline: DockHeadline | null;
  values: DockValues;
}

export const ConfettiFlight: FC<ConfettiFlightProps> = ({ headline, values }) => {
  if (headline === null) {
    return null;
  }

  const headlineStyle = {
    position: 'absolute' as const,
    left: headline.box.left,
    top: headline.box.top,
    width: headline.box.width,
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
        <ConfettiHeadline>{headline.text}</ConfettiHeadline>
      </motion.div>
    </Box>
  );
};
