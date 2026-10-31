import Box from '@mui/material/Box';
import type { FC } from 'react';
import { kkTokens } from '../../../tokens';

interface KkLessonRailFillProps {
  value: number;
}

export const KkLessonRailFill: FC<KkLessonRailFillProps> = ({ value }) => (
  <Box
    aria-hidden
    data-kk-lesson-rail-fill
    style={{ transform: `scaleX(${value})` }}
    sx={(theme) => ({
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      height: kkTokens.line.page,
      transformOrigin: 'left center',
      backgroundColor: (theme.vars ?? theme).palette.primary.main,
    })}
  />
);
