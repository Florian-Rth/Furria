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
      justifyContent: 'space-between',
      gap: 1,
      minWidth: 0,
      [LESSON_PHONE]: {
        '&:has([data-kk-studio-edit]) [data-kk-lesson-hall-text]': { display: 'none' },
      },
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
