import type { KkGroupTone } from '@furria/ui/group-tone';
import { eventToneOf } from '@furria/ui/group-tone';
import type { KkImageSource, KkPictureUrls } from '@furria/ui/image-source';
import { toImageSource } from '@furria/ui/image-source';

export const EVENT_CANCELLED_STAMP = 'Abgesagt';

export interface EventCoverFacts {
  eventId: number;
  picture: KkPictureUrls | null;
  isCancelled: boolean;
}

export interface EventCover {
  image: KkImageSource | null;
  tone: KkGroupTone;
  cancelledLabel: string | null;
}

export const toEventCover = (facts: EventCoverFacts, sizes: string): EventCover => ({
  image: toImageSource(facts.picture, 'banner', sizes),
  tone: eventToneOf(facts.eventId),
  cancelledLabel: facts.isCancelled ? EVENT_CANCELLED_STAMP : null,
});
