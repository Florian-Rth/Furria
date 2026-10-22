import { eventToneOf } from '@furria/ui/group-tone';
import type { KkSx } from '@furria/ui/kk-sx';
import type { FC } from 'react';
import { PictureSection } from '@/features/pictures/components/PictureSection';
import { EVENT_CANCELLED_STAMP } from '@/lib/event-cover';
import { EVENT_SECTION_TITLES } from '../events-labels';
import { useEventPictureDesk } from '../hooks/use-event-picture-desk';
import type { EventDetails } from '../schemas';
import { EventGallerySheet } from './EventGallerySheet';

interface EventPicturePanelProps {
  event: EventDetails;
  sx?: KkSx;
}

export const EventPicturePanel: FC<EventPicturePanelProps> = ({ event, sx }) => {
  const desk = useEventPictureDesk(event);
  const stampLabel = event.cancelledAt === null ? null : EVENT_CANCELLED_STAMP;
  const tone = eventToneOf(event.eventId);

  return (
    <PictureSection
      desk={desk.section}
      tone={tone}
      alt=""
      title={EVENT_SECTION_TITLES.picture}
      stampLabel={stampLabel}
      sx={sx}
    >
      <EventGallerySheet onPick={desk.pickPhoto} />
    </PictureSection>
  );
};
