import Box from '@mui/material/Box';
import type { FC, PropsWithChildren } from 'react';
import { trackEdgeOf } from '../../../KkShell/internal/track-edge';
import { HIDDEN_HEADING, LESSON_CONTAINER, LESSON_WIDE, LESSON_WIDE_TALL } from '../lesson-query';

const COMPOSED_HEIGHT = 'min(100%, calc(max(36.5cqw, 24rem) + 5rem))';

interface KkLessonRootProps extends PropsWithChildren {
  label: string;
  title: string;
}

export const KkLessonRoot: FC<KkLessonRootProps> = ({ label, title, children }) => (
  <Box
    component="section"
    aria-label={label}
    data-kk-lesson
    sx={{
      position: 'relative',
      width: '100%',
      maxWidth: { desktop: '86rem' },
      minWidth: 0,
      height: `calc(100dvh - ${trackEdgeOf('top')} - ${trackEdgeOf('bottom')})`,
      mx: 'auto',
      containerType: 'size',
      containerName: LESSON_CONTAINER,
      userSelect: 'none',
      WebkitUserSelect: 'none',
      touchAction: 'manipulation',
    }}
  >
    <Box component="h1" sx={HIDDEN_HEADING}>
      {title}
    </Box>
    <Box
      sx={{
        display: 'grid',
        width: '100%',
        height: '100%',
        gridTemplateAreas: '"card" "rail" "dock"',
        gridTemplateColumns: 'minmax(0, 1fr)',
        gridTemplateRows: 'minmax(0, 1fr) auto auto',
        rowGap: { xs: 1.25, desktop: 2 },
        columnGap: { xs: 1.5, desktop: 3 },
        [LESSON_WIDE]: {
          gridTemplateAreas: '"card card" "rail dock"',
          gridTemplateColumns: 'minmax(0, 1fr) auto',
          gridTemplateRows: 'minmax(0, 1fr) auto',
        },
        [LESSON_WIDE_TALL]: {
          height: COMPOSED_HEIGHT,
          mt: `calc((100cqh - ${COMPOSED_HEIGHT}) / 2)`,
        },
      }}
    >
      {children}
    </Box>
  </Box>
);
