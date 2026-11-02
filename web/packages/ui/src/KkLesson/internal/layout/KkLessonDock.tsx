import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';
import { LESSON_CRAMPED, LESSON_PHONE } from '../lesson-query';

interface KkLessonDockProps extends PropsWithChildren {
  label: string;
}

export const KkLessonDock: FC<KkLessonDockProps> = ({ label, children }) => (
  <Stack
    direction="row"
    role="group"
    aria-label={label}
    data-kk-lesson-dock
    sx={{
      alignItems: 'center',
      justifyContent: 'flex-start',
      gap: 1,
      '& > [data-kk-lesson-hall]': { marginInlineStart: 'auto' },
      minWidth: 0,
      [LESSON_PHONE]: { '& [data-kk-key-help]': { display: 'none' } },
      [LESSON_CRAMPED]: {
        flexWrap: 'wrap',
        justifyContent: 'center',
        rowGap: 0.75,
        '& > :has([data-kk-practice-play])': { order: -1 },
      },
    }}
  >
    {children}
  </Stack>
);
