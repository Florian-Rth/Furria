import Box from '@mui/material/Box';
import type { FC, Ref } from 'react';

interface KkEjStageMeasureProps {
  measureRef: Ref<HTMLDivElement>;
}

export const KkEjStageMeasure: FC<KkEjStageMeasureProps> = ({ measureRef }) => (
  <Box
    ref={measureRef}
    aria-hidden
    data-kk-ej-stage-measure
    sx={{ position: 'absolute', inset: 0, pointerEvents: 'none', visibility: 'hidden' }}
  />
);
