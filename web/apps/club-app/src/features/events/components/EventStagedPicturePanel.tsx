import type { KkSx } from '@furria/ui';
import { KkBannerDesk, KkPanelSection } from '@furria/ui';
import Box from '@mui/material/Box';
import type { FC } from 'react';
import { PICTURE_ACCEPT, PICTURE_DESK_LABELS } from '@/features/pictures';
import { EVENT_SECTION_TITLES } from '../events-labels';
import type { StagedEventPictureDesk } from '../hooks/use-staged-event-picture';
import { EventGallerySheet } from './EventGallerySheet';

interface EventStagedPicturePanelProps {
  desk: StagedEventPictureDesk;
  sx?: KkSx;
}

export const EventStagedPicturePanel: FC<EventStagedPicturePanelProps> = ({ desk, sx }) => {
  const { banner } = desk;

  return (
    <KkPanelSection title={EVENT_SECTION_TITLES.picture} sx={sx}>
      <KkBannerDesk
        id="event-picture"
        state={banner.state}
        preview={banner.preview}
        source={null}
        uncroppedSource={banner.uncroppedSource}
        crop={banner.crop}
        progress={0}
        alt=""
        readOnly={false}
        labels={PICTURE_DESK_LABELS.eventPicture}
        actions={desk.actions}
      />
      <Box
        component="input"
        type="file"
        accept={PICTURE_ACCEPT}
        ref={desk.fileInputRef}
        onChange={desk.onFileChosen}
        hidden
      />
      <EventGallerySheet onPick={desk.pickPhoto} />
    </KkPanelSection>
  );
};
