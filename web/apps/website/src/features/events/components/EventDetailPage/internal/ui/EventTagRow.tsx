import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { deriveEventTags } from '@/features/events/event-detail-display';
import type { Event } from '@/lib/seed/events';

interface EventTagRowProps {
  event: Event;
}

export const EventTagRow: FC<EventTagRowProps> = ({ event }) => {
  const tags = deriveEventTags(event);

  return (
    <Stack direction="row" sx={{ gap: 1, flexWrap: 'wrap' }}>
      {tags.map((tag) => (
        <Chip key={tag} size="small" variant="outlined" label={tag} />
      ))}
    </Stack>
  );
};
