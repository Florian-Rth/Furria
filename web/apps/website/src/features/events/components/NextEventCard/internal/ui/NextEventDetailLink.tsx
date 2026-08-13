import Button from '@mui/material/Button';
import { Link as RouterLink } from '@tanstack/react-router';
import type { FC } from 'react';
import { buildEventHref } from '@/features/events/event-display';
import { nextEventDetailLabel } from '@/features/events/next-event-content';

interface NextEventDetailLinkProps {
  eventId: string;
  emphasis: 'contained' | 'outlined';
}

export const NextEventDetailLink: FC<NextEventDetailLinkProps> = ({ eventId, emphasis }) => (
  <Button component={RouterLink} to={buildEventHref(eventId)} variant={emphasis} size="large">
    {nextEventDetailLabel}
  </Button>
);
