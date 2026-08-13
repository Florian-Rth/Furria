import { KkEyebrow } from '@furria/ui';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Link as RouterLink } from '@tanstack/react-router';
import type { FC } from 'react';
import { endOfSeasonContent } from '@/features/events/list-content';

export const EventEndOfSeason: FC = () => (
  <Card
    data-kk-events-end-of-season
    sx={{ px: { xs: 3, md: 5 }, py: { xs: 5, md: 7 }, textAlign: 'center' }}
  >
    <Stack sx={{ gap: 2, alignItems: 'center' }}>
      <KkEyebrow tone="muted">{endOfSeasonContent.kicker}</KkEyebrow>
      <Typography variant="h2" component="h2">
        {endOfSeasonContent.headline}
      </Typography>
      <Typography variant="body1" sx={{ color: 'text.secondary', maxWidth: '36rem' }}>
        {endOfSeasonContent.body}
      </Typography>
      <Stack direction="row" sx={{ gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
        <Button
          component={RouterLink}
          to={endOfSeasonContent.galleryTo}
          variant="contained"
          size="large"
        >
          {endOfSeasonContent.galleryLabel}
        </Button>
        <Button
          component={RouterLink}
          to={endOfSeasonContent.newsTo}
          variant="outlined"
          size="large"
        >
          {endOfSeasonContent.newsLabel}
        </Button>
      </Stack>
    </Stack>
  </Card>
);
