import Button from '@mui/material/Button';
import { Link as RouterLink } from '@tanstack/react-router';
import type { FC } from 'react';
import type { EventAddress } from '@/features/events/event-display';
import { buildEventHref } from '@/features/events/event-display';
import { nextEventDetailLabel } from '@/features/events/next-event-content';

interface NextEventDetailLinkProps {
  event: EventAddress;
  emphasis: 'contained' | 'outlined';
}

export const NextEventDetailLink: FC<NextEventDetailLinkProps> = ({ event, emphasis }) => {
  const href = buildEventHref(event);

  return (
    <Button component={RouterLink} to={href} variant={emphasis} size="large">
      {nextEventDetailLabel}
    </Button>
  );
};
