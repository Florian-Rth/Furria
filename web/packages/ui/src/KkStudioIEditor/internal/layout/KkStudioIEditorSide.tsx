import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';
import { KK_STUDIO_I_WIDE } from '../../studio-i-editor-query';

export const KkStudioIEditorSide: FC<PropsWithChildren> = ({ children }) => (
  <Stack
    data-kk-studio-i-side
    sx={{
      gridArea: 'side',
      display: 'none',
      minWidth: 0,
      minHeight: 0,
      gap: 1.5,
      [KK_STUDIO_I_WIDE]: { display: 'flex' },
    }}
  >
    {children}
  </Stack>
);
