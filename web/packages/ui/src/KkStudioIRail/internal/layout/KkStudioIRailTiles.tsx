import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';
import { KK_STUDIO_I_WIDE } from '../../../KkStudioIEditor/studio-i-editor-query';

export const KkStudioIRailTiles: FC<PropsWithChildren> = ({ children }) => (
  <Stack
    direction="row"
    sx={{ gap: 0.5, [KK_STUDIO_I_WIDE]: { flexDirection: 'column', gap: 0.25 } }}
  >
    {children}
  </Stack>
);
