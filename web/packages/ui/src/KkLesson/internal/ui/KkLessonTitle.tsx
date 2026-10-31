import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { KkEyebrow } from '../../../KkEyebrow';
import { HIDDEN_HEADING } from '../lesson-query';
import { KkLessonFade } from './KkLessonFade';

const EYEBROW_LINE = '1.125rem';
const NAME_LINE = '2.25rem';

interface KkLessonTitleProps {
  fadeKey: string;
  eyebrow: string;
  name: string;
}

export const KkLessonTitle: FC<KkLessonTitleProps> = ({ fadeKey, eyebrow, name }) => {
  const announced = eyebrow === '' ? name : `${name}, ${eyebrow}`;

  return (
    <Stack data-kk-lesson-title sx={{ flex: 1, minWidth: 0, gap: 0.25 }}>
      <Box component="h2" aria-live="polite" aria-atomic sx={HIDDEN_HEADING}>
        {announced}
      </Box>
      <KkLessonFade fadeKey={fadeKey} silent sx={{ height: EYEBROW_LINE }}>
        <KkEyebrow
          sx={{
            display: 'block',
            lineHeight: EYEBROW_LINE,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {eyebrow}
        </KkEyebrow>
      </KkLessonFade>
      <KkLessonFade fadeKey={fadeKey} silent sx={{ height: NAME_LINE }}>
        <Typography
          component="span"
          variant="h1"
          noWrap
          data-kk-lesson-name
          sx={{ display: 'block', lineHeight: NAME_LINE }}
        >
          {name}
        </Typography>
      </KkLessonFade>
    </Stack>
  );
};
