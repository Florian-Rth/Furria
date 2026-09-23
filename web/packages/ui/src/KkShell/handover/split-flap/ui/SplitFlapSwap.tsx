import Box from '@mui/material/Box';
import { motion } from 'motion/react';
import type { CSSProperties, FC } from 'react';
import type { KkHandoverSwapProps } from '../../../handover-stage';
import { cellWindowOf } from '../logic/split-flap-flaps';
import { useSplitFlapSwap } from '../logic/use-split-flap-swap';
import { SplitFlapBrandFlap } from './SplitFlapBrandFlap';
import { SplitFlapFlap } from './SplitFlapFlap';
import { SplitFlapGlint } from './SplitFlapGlint';

const STACKED_STYLE: CSSProperties = { gridArea: '1 / 1', minWidth: 0 };

const BOARD_STYLE: CSSProperties = {
  position: 'absolute',
  inset: 0,
  clipPath: 'inset(-100% 0 -100% 0)',
  pointerEvents: 'none',
};

export const SplitFlapSwap: FC<KkHandoverSwapProps> = ({ rest, title, restText, titleText }) => {
  const swap = useSplitFlapSwap(restText, titleText);
  const { cells, top, height } = swap.geometry;
  const brandFlap =
    restText === null ? (
      <SplitFlapBrandFlap progress={swap.progress}>{rest}</SplitFlapBrandFlap>
    ) : null;
  const flaps = cells.map((cell, index) => {
    const window = cellWindowOf(index, cells.length, swap.lead);

    return (
      <SplitFlapFlap
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
      data-kk-splitFlap
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
      <SplitFlapGlint
        host={swap.glint.host}
        sweepX={swap.glint.sweepX}
        sweepOpacity={swap.glint.sweepOpacity}
      />
    </Box>
  );
};
