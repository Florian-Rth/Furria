import Box from '@mui/material/Box';
import type { FC, PropsWithChildren } from 'react';
import { kkTokens } from '../../../tokens';
import {
  BESIDE_PICTURE_HEIGHT,
  LESSON_CRAMPED,
  LESSON_PICTURE_CONTAINER,
  LESSON_WIDE,
  LESSON_WIDE_TALL,
} from '../lesson-query';

const RADIUS = `${kkTokens.radius.base}px`;

interface KkLessonPictureProps extends PropsWithChildren {
  label: string;
  paired: boolean;
  docked?: boolean;
}

export const KkLessonPicture: FC<KkLessonPictureProps> = ({
  label,
  paired,
  docked = false,
  children,
}) => (
  <Box
    role="group"
    aria-label={label}
    data-kk-lesson-picture
    data-kk-lesson-paired={paired}
    data-kk-lesson-docked={docked}
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
      [LESSON_WIDE_TALL]: {
        height: BESIDE_PICTURE_HEIGHT,
        borderRadius: `${RADIUS} ${RADIUS} 0 0`,
      },
      [LESSON_CRAMPED]: { minHeight: '3rem' },
      '&[data-kk-lesson-docked="true"]': { borderRadius: RADIUS },
    }}
  >
    {children}
  </Box>
);
