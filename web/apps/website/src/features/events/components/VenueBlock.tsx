import { KkLead, KkSection } from '@furria/ui';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { VENUE_FACTS, venueKicker, venueLead, venueTitle } from '@/features/events/venue-content';

export const VenueBlock: FC = () => (
  <KkSection>
    <KkSection.Header kicker={venueKicker} title={venueTitle} />
    <KkLead>{venueLead}</KkLead>
    <Stack component="dl" sx={{ gap: 2, maxWidth: '36rem', m: 0 }}>
      {VENUE_FACTS.map((fact) => (
        <Stack key={fact.label} direction="row" sx={{ gap: 2, alignItems: 'baseline' }}>
          <Typography
            variant="caption"
            component="dt"
            sx={{ fontWeight: 800, letterSpacing: '0.08em', minWidth: '9rem' }}
          >
            {fact.label}
          </Typography>
          <Typography variant="body2" component="dd" sx={{ color: 'text.secondary', m: 0 }}>
            {fact.value}
          </Typography>
        </Stack>
      ))}
    </Stack>
  </KkSection>
);
