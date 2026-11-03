import Typography from '@mui/material/Typography';
import type { FC } from 'react';

interface KkLessonHeadingProps {
  text: string;
}

export const KkLessonHeading: FC<KkLessonHeadingProps> = ({ text }) => (
  <Typography
    component="span"
    variant="h4"
    aria-hidden
    noWrap
    data-kk-lesson-heading
    sx={{ textAlign: 'center' }}
  >
    {text}
  </Typography>
);
