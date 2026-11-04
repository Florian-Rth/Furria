import type { KkScreenOrigin } from '@furria/ui/screen-declaration';

const TABLE_PLAN_LABEL = 'Tischplan';
const EVENTS_LABEL = 'Veranstaltungen';

export interface HallOriginFacts {
  eventId: number | undefined;
  venueId: number | null;
  venueName: string | null;
  canOpenVenue: boolean;
}

export const hallBuilderOriginOf = (facts: HallOriginFacts): KkScreenOrigin => {
  if (facts.eventId !== undefined) {
    return {
      label: TABLE_PLAN_LABEL,
      to: '/events/$eventId/tischplan',
      params: { eventId: String(facts.eventId) },
    };
  }
  if (facts.canOpenVenue && facts.venueId !== null) {
    return {
      label: facts.venueName ?? EVENTS_LABEL,
      to: '/manage/venues/$venueId',
      params: { venueId: String(facts.venueId) },
    };
  }

  return { label: EVENTS_LABEL, to: '/events' };
};
