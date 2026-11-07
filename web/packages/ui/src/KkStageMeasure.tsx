import Box from '@mui/material/Box';
import type { FC, Ref } from 'react';

interface KkStageMeasureProps {
  measureRef: Ref<HTMLDivElement>;
}

export const KkStageMeasure: FC<KkStageMeasureProps> = ({ measureRef }) => (
  <Box
    ref={measureRef}
    aria-hidden
    data-kk-stage-measure
    sx={{ position: 'absolute', inset: 0, pointerEvents: 'none', visibility: 'hidden' }}
  />
);
