import { definePublicDetailResource } from '@/lib/public-resource/define-public-resource';
import { idSlugAddress } from '@/lib/public-resource/detail-address';
import type { Event } from './schemas';
import { EventDetailSchema, EventsResponseSchema } from './schemas';

type EventAddress = Pick<Event, 'eventId' | 'title'>;

export const publicEvents = definePublicDetailResource({
  path: '/api/public/events',
  schema: EventsResponseSchema,
  key: 'public-events',
  select: (response): Event[] => response.events,
  detail: {
    schema: EventDetailSchema,
    address: idSlugAddress((event: EventAddress) => ({ id: event.eventId, title: event.title })),
  },
});
