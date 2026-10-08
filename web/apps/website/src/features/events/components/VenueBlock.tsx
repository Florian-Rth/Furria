import { KkSection } from '@furria/ui';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { deriveVenueFacts } from '@/features/events/event-detail-display';
import type { EventVenue } from '@/lib/public-events/schemas';

const VENUE_KICKER = 'DER SPIELORT';

interface VenueBlockProps {
  venue: EventVenue;
}

export const VenueBlock: FC<VenueBlockProps> = ({ venue }) => {
  const facts = deriveVenueFacts(venue);
  const title = venue.name.toUpperCase();

  return (
    <KkSection>
      <KkSection.Header kicker={VENUE_KICKER} title={title} />
      <Stack component="dl" sx={{ gap: 2, maxWidth: '36rem', m: 0 }}>
        {facts.map((fact) => (
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
};
