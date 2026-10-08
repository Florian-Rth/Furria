import { useState } from 'react';
import type { Event } from '@/lib/public-events/schemas';
import { isTicketRequestWindowOpen } from '../ticket-request-window';

export const useTicketRequestWindow = (event: Pick<Event, 'status' | 'startsAt'>): boolean => {
  const [now] = useState(() => new Date());

  return isTicketRequestWindowOpen(event, now);
};
