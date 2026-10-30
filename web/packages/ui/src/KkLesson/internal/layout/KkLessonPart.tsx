import Stack from '@mui/material/Stack';
import type { CSSObject } from '@mui/material/styles';
import type { FC, PropsWithChildren } from 'react';
import { LESSON_CRAMPED, LESSON_TALL, LESSON_WIDE, LESSON_WIDE_TALL } from '../lesson-query';

export type KkLessonPartName = 'head' | 'counts' | 'text' | 'next';

const ALIGN: Record<KkLessonPartName, string> = {
  head: 'center',
  counts: 'center',
  text: 'stretch',
  next: 'center',
};

const WIDE_SIDE = { px: { xs: 2, desktop: 3 } } as const;

const placeOf: Record<KkLessonPartName, CSSObject> = {
  head: {
    pt: 1.25,
    [LESSON_WIDE]: { ...WIDE_SIDE, pt: 2 },
    [LESSON_WIDE_TALL]: { pt: 3 },
    [LESSON_CRAMPED]: { '& > [data-kk-lesson-beat]': { display: 'none' } },
  },
  counts: { pt: 0.75, [LESSON_WIDE]: { ...WIDE_SIDE, pt: 1.25 } },
  text: { pt: 0.75, pb: 1.25, [LESSON_WIDE]: { ...WIDE_SIDE, pt: 1.25, pb: 2 } },
  next: {
    display: 'none',
    pb: 1,
    [LESSON_TALL]: { display: 'flex' },
    [LESSON_WIDE_TALL]: { ...WIDE_SIDE, display: 'flex', pb: 2 },
    [LESSON_CRAMPED]: { display: 'none' },
  },
};

interface KkLessonPartProps extends PropsWithChildren {
  name: KkLessonPartName;
}

export const KkLessonPart: FC<KkLessonPartProps> = ({ name, children }) => (
  <Stack
    direction="row"
    data-kk-lesson-part={name}
    sx={{
      gridArea: name,
      minWidth: 0,
      minHeight: 0,
      alignItems: ALIGN[name],
      gap: 1.25,
      px: { xs: 1.5, desktop: 2.5 },
      ...placeOf[name],
    }}
  >
    {children}
  </Stack>
);
