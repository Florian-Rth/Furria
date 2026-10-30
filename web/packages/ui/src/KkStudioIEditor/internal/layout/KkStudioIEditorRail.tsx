import Box from '@mui/material/Box';
import type { FC, PropsWithChildren } from 'react';
import { trackEdgeOf } from '../../../KkShell/internal/track-edge';
import { KK_STUDIO_I_WIDE } from '../../studio-i-editor-query';

export const KkStudioIEditorRail: FC<PropsWithChildren> = ({ children }) => (
  <Box
    data-kk-studio-i-rail-slot
    sx={{
      gridArea: 'rail',
      display: 'grid',
      minWidth: 0,
      minHeight: 0,
      ml: `calc(-1 * ${trackEdgeOf('left')})`,
      mr: `calc(-1 * ${trackEdgeOf('right')})`,
      [KK_STUDIO_I_WIDE]: { ml: 0, mr: 0 },
    }}
  >
    {children}
  </Box>
);
