import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';
import { trackEdgeOf } from '../../../KkShell/internal/track-edge';
import type { KkSx } from '../../../kk-sx';

const LESSON_WIDTH = '40rem';

interface KkStudioFLessonRootProps extends PropsWithChildren {
  label: string;
  sx?: KkSx;
}

export const KkStudioFLessonRoot: FC<KkStudioFLessonRootProps> = ({ label, sx, children }) => (
  <Stack
    component="section"
    aria-label={label}
    data-kk-studio-f
    sx={[
      {
        width: '100%',
        maxWidth: { desktop: LESSON_WIDTH },
        height: `calc(100dvh - ${trackEdgeOf('top')} - ${trackEdgeOf('bottom')})`,
        minHeight: 0,
        mx: 'auto',
        gap: { xs: 1.5, desktop: 2 },
      },
      ...(Array.isArray(sx) ? sx : [sx]),
    ]}
  >
    {children}
  </Stack>
);
