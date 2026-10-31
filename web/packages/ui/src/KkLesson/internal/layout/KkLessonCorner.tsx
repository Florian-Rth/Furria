import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';

export type KkLessonCornerSide = 'start' | 'end';

const SIDES: Record<KkLessonCornerSide, { left: number | 'auto'; right: number | 'auto' }> = {
  start: { left: 0, right: 'auto' },
  end: { left: 'auto', right: 0 },
};

interface KkLessonCornerProps extends PropsWithChildren {
  side: KkLessonCornerSide;
}

export const KkLessonCorner: FC<KkLessonCornerProps> = ({ side, children }) => (
  <Stack
    direction="row"
    data-kk-lesson-corner={side}
    sx={{
      position: 'absolute',
      top: 0,
      ...SIDES[side],
      zIndex: 3,
      p: 0.75,
      gap: 0.5,
      alignItems: 'center',
    }}
  >
    {children}
  </Stack>
);
