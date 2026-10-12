import Box from '@mui/material/Box';
import { motion } from 'motion/react';
import type { FC } from 'react';
import type { KkSx } from '../../../kk-sx';
import { useViewer } from '../logic/viewer-context';
import { KkViewerSlide } from './KkViewerSlide';

const TRACK_STYLE = { position: 'absolute', inset: 0 } as const;

interface KkViewerStageProps {
  sx?: KkSx;
}

export const KkViewerStage: FC<KkViewerStageProps> = ({ sx }) => {
  const viewer = useViewer();

  return (
    <Box
      ref={viewer.stage.stageRef}
      {...viewer.stageHandlers}
      data-kk-viewer-stage
      sx={[
        {
          position: 'relative',
          flex: 1,
          minHeight: 0,
          minWidth: 0,
          clipPath: 'inset(0)',
          touchAction: 'none',
          userSelect: 'none',
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      <motion.div style={{ ...TRACK_STYLE, x: viewer.stage.track }}>
        {viewer.slides.map((slide) => (
          <KkViewerSlide key={slide.item.key} slide={slide} />
        ))}
      </motion.div>
    </Box>
  );
};
