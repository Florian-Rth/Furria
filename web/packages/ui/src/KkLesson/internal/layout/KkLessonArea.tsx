import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';

export type KkLessonAreaName = 'card' | 'rail' | 'dock';

interface KkLessonAreaProps extends PropsWithChildren {
  name: KkLessonAreaName;
}

export const KkLessonArea: FC<KkLessonAreaProps> = ({ name, children }) => (
  <Stack
    data-kk-lesson-area={name}
    sx={{ gridArea: name, minWidth: 0, minHeight: 0, justifyContent: 'center' }}
  >
    {children}
  </Stack>
);
