import Box from '@mui/material/Box';
import { motion } from 'motion/react';
import type { CSSProperties, FC } from 'react';
import type { KkHandoverSwapProps } from '../../../handover-stage';
import { cellWindowOf } from '../logic/fallblatt-flaps';
import { useFallblattSwap } from '../logic/use-fallblatt-swap';
import { FallblattBrandFlap } from './FallblattBrandFlap';
import { FallblattFlap } from './FallblattFlap';
import { FallblattGlint } from './FallblattGlint';

const STACKED_STYLE: CSSProperties = { gridArea: '1 / 1', minWidth: 0 };

const BOARD_STYLE: CSSProperties = {
  position: 'absolute',
  inset: 0,
  clipPath: 'inset(-100% 0 -100% 0)',
  pointerEvents: 'none',
};

export const FallblattSwap: FC<KkHandoverSwapProps> = ({ rest, title, restText, titleText }) => {
  const swap = useFallblattSwap(restText, titleText);
  const { cells, top, height } = swap.geometry;
  const brandFlap =
    restText === null ? (
      <FallblattBrandFlap progress={swap.progress}>{rest}</FallblattBrandFlap>
    ) : null;
  const flaps = cells.map((cell, index) => {
    const window = cellWindowOf(index, cells.length, swap.lead);

    return (
      <FallblattFlap
        key={cell.slot}
        cell={cell}
        window={window}
        progress={swap.progress}
        top={top}
        height={height}
      />
    );
  });

  return (
    <Box
      ref={swap.stageRef}
      data-kk-fallblatt
      sx={{ position: 'relative', display: 'grid', alignItems: 'center', minWidth: 0 }}
    >
      <motion.div ref={swap.restRef} style={{ ...STACKED_STYLE, opacity: swap.restOpacity }}>
        {rest}
      </motion.div>
      <motion.div ref={swap.titleRef} style={{ ...STACKED_STYLE, opacity: swap.titleOpacity }}>
        {title}
      </motion.div>
      <motion.div aria-hidden style={{ ...BOARD_STYLE, opacity: swap.boardOpacity }}>
        {brandFlap}
        {flaps}
      </motion.div>
      <FallblattGlint
        host={swap.glint.host}
        sweepX={swap.glint.sweepX}
        sweepOpacity={swap.glint.sweepOpacity}
      />
    </Box>
  );
};
