import Box from '@mui/material/Box';
import type { FC, PropsWithChildren } from 'react';

const CARD_INSET = -2.25;

export const KkEditorStageBleed: FC<PropsWithChildren> = ({ children }) => (
  <Box
    sx={{
      flex: 1,
      minWidth: 0,
      minHeight: 0,
      mx: CARD_INSET,
      display: 'grid',
      gridTemplateColumns: 'minmax(0, 1fr)',
      gridTemplateRows: 'minmax(0, 1fr)',
      position: 'relative',
    }}
  >
    {children}
  </Box>
);
