import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { SEASON_STEPS, seasonChapter, seasonIntro } from '@/features/club/season-content';
import { ChapterHeader } from '../ChapterHeader/ChapterHeader';
import { SeasonRow } from './internal/layout/SeasonRow';
import { SeasonStep } from './internal/ui/SeasonStep';

export const SeasonArc: FC = () => (
  <Stack component="section" data-kk-season sx={{ gap: { xs: 4, md: 6 } }}>
    <ChapterHeader
      numeral={seasonChapter.numeral}
      kicker={seasonChapter.kicker}
      title={seasonChapter.title}
    />
    <Typography
      variant="body1"
      sx={{ color: 'text.secondary', fontWeight: 500, maxWidth: '48rem' }}
    >
      {seasonIntro}
    </Typography>
    <SeasonRow>
      {SEASON_STEPS.map((step, index) => (
        <Grid key={step.tag} size={{ xs: 12, sm: 6, md: 'grow' }}>
          <SeasonStep step={step} accented={index === 0} />
        </Grid>
      ))}
    </SeasonRow>
  </Stack>
);
