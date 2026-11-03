import Stack from '@mui/material/Stack';
import type { CSSObject } from '@mui/material/styles';
import type { FC, PropsWithChildren } from 'react';
import { BESIDE_VIDEO_WIDTH, LESSON_PAIRED, LESSON_WIDE_TALL } from '../lesson-query';

export type KkLessonCornerSide = 'start' | 'end';

const SIDES: Record<KkLessonCornerSide, CSSObject> = {
  start: { left: 0, right: 'auto' },
  end: {
    left: 'auto',
    right: 0,
    [LESSON_WIDE_TALL]: { [LESSON_PAIRED]: { right: `calc(100cqw - ${BESIDE_VIDEO_WIDTH})` } },
  },
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
