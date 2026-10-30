import Box from '@mui/material/Box';
import type { FC, PropsWithChildren } from 'react';
import { kkTokens } from '../../../tokens';
import { LESSON_WIDE, LESSON_WIDE_TALL } from '../lesson-query';

interface KkLessonCardProps extends PropsWithChildren {
  label: string;
}

export const KkLessonCard: FC<KkLessonCardProps> = ({ label, children }) => (
  <Box
    component="article"
    aria-label={label}
    data-kk-lesson-card
    sx={(theme) => ({
      display: 'grid',
      flex: 1,
      minWidth: 0,
      minHeight: 0,
      borderRadius: `${kkTokens.radius.base}px`,
      backgroundColor: (theme.vars ?? theme).palette.background.paper,
      boxShadow: `inset 0 0 0 ${kkTokens.line.hair}px ${(theme.vars ?? theme).palette.divider}, ${kkTokens.shadow.rest}`,
      gridTemplateAreas: '"picture" "head" "counts" "text" "next"',
      gridTemplateColumns: 'minmax(0, 1fr)',
      gridTemplateRows: 'minmax(0, 1fr) auto auto auto auto',
      [LESSON_WIDE]: {
        gridTemplateAreas: '"picture head" "picture counts" "picture text" "picture next"',
        gridTemplateColumns: 'minmax(0, 11fr) minmax(0, 9fr)',
        gridTemplateRows: 'auto auto minmax(0, 1fr) auto',
      },
      [LESSON_WIDE_TALL]: { gridTemplateColumns: 'minmax(0, 13fr) minmax(0, 7fr)' },
    })}
  >
    {children}
  </Box>
);
