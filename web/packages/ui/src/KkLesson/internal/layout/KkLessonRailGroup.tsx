import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';

interface KkLessonRailGroupProps extends PropsWithChildren {
  label: string;
}

export const KkLessonRailGroup: FC<KkLessonRailGroupProps> = ({ label, children }) => (
  <Stack
    direction="row"
    role="group"
    aria-label={label}
    data-kk-lesson-rail-group
    sx={{ flexShrink: 0, alignItems: 'center', gap: 0.5 }}
  >
    {children}
  </Stack>
);
