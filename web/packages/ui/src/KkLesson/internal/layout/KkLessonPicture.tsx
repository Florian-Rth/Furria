import Box from '@mui/material/Box';
import type { FC, PropsWithChildren } from 'react';
import { kkTokens } from '../../../tokens';
import { LESSON_CRAMPED, LESSON_PICTURE_CONTAINER, LESSON_WIDE } from '../lesson-query';

const RADIUS = `${kkTokens.radius.base}px`;

interface KkLessonPictureProps extends PropsWithChildren {
  label: string;
  paired: boolean;
}

export const KkLessonPicture: FC<KkLessonPictureProps> = ({ label, paired, children }) => (
  <Box
    role="group"
    aria-label={label}
    data-kk-lesson-picture
    data-kk-lesson-paired={paired}
    sx={{
      gridArea: 'picture',
      position: 'relative',
      minWidth: 0,
      minHeight: '8rem',
      containerType: 'size',
      containerName: LESSON_PICTURE_CONTAINER,
      borderRadius: `${RADIUS} ${RADIUS} 0 0`,
      backgroundColor: kkTokens.overlay.scrimInk,
      [LESSON_WIDE]: { borderRadius: `${RADIUS} 0 0 ${RADIUS}` },
      [LESSON_CRAMPED]: { minHeight: '3rem' },
    }}
  >
    {children}
  </Box>
);
