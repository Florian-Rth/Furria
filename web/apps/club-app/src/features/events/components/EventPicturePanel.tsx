import { eventToneOf, KkBannerDesk, KkEventPicture, KkPanelSection } from '@furria/ui';
import Box from '@mui/material/Box';
import type { FC } from 'react';
import { PICTURE_ACCEPT } from '@/features/pictures';
import { EVENT_CANCELLED_STAMP } from '@/lib/event-cover';
import { EVENT_PICTURE_LABELS } from '../event-picture-copy';
import { EVENT_SECTION_TITLES } from '../events-labels';
import { useEventPictureDesk } from '../hooks/use-event-picture-desk';
import { useEventsWorkbench } from '../hooks/use-events-workbench';
import type { EventDetails } from '../schemas';
import { EventGallerySheet } from './EventGallerySheet';

interface EventPicturePanelProps {
  event: EventDetails;
}

export const EventPicturePanel: FC<EventPicturePanelProps> = ({ event }) => {
  const desk = useEventPictureDesk(event);
  const { managesEvents } = useEventsWorkbench();
  const { banner } = desk;
  const stampLabel = event.cancelledAt === null ? null : EVENT_CANCELLED_STAMP;
  const tone = eventToneOf(event.eventId);
  const poster = <KkEventPicture image={null} tone={tone} />;

  const editingTools = managesEvents ? (
    <>
      <Box
        component="input"
        type="file"
        accept={PICTURE_ACCEPT}
        ref={desk.fileInputRef}
        onChange={desk.onFileChosen}
        hidden
      />
      <EventGallerySheet onPick={desk.pickPhoto} />
    </>
  ) : null;

  return (
    <KkPanelSection title={EVENT_SECTION_TITLES.picture}>
      <KkBannerDesk
        id="event-picture"
        state={banner.state}
        poster={poster}
        stampLabel={stampLabel}
        source={banner.source}
        uncroppedSource={banner.uncroppedSource}
        crop={banner.crop}
        progress={banner.progress}
        alt=""
        readOnly={!managesEvents}
        labels={EVENT_PICTURE_LABELS}
        actions={desk.actions}
      />
      {editingTools}
    </KkPanelSection>
  );
};
