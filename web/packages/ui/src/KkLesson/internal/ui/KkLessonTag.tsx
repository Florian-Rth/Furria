import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { kkTokens } from '../../../tokens';

interface KkLessonTagProps {
  text: string;
}

export const KkLessonTag: FC<KkLessonTagProps> = ({ text }) => (
  <Typography
    component="span"
    variant="caption"
    data-kk-lesson-tag
    sx={{
      display: 'inline-flex',
      alignItems: 'center',
      height: '1.75rem',
      px: 1.25,
      borderRadius: `${kkTokens.radius.pill}px`,
      fontWeight: 800,
      lineHeight: 1,
      whiteSpace: 'nowrap',
      color: kkTokens.overlay.onPhotoText,
      backgroundColor: `color-mix(in srgb, ${kkTokens.overlay.scrimInk} 58%, transparent)`,
      backdropFilter: `blur(${kkTokens.glass.blur})`,
    }}
  >
    {text}
  </Typography>
);
