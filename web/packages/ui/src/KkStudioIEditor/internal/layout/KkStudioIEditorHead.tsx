import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';
import { KK_STUDIO_I_WIDE, KK_STUDIO_I_WIDE_SHORT } from '../../studio-i-editor-query';

export const KkStudioIEditorHead: FC<PropsWithChildren> = ({ children }) => (
  <Stack
    direction="row"
    data-kk-studio-i-head
    sx={{
      gridArea: 'head',
      alignItems: 'center',
      gap: { xs: 1.5, desktop: 2 },
      minWidth: 0,
      minHeight: '6rem',
      [KK_STUDIO_I_WIDE]: { minHeight: '4.75rem' },
      [KK_STUDIO_I_WIDE_SHORT]: {
        minHeight: '3.5rem',
        '& [data-kk-practice-count]': { display: 'none' },
      },
    }}
  >
    {children}
  </Stack>
);
