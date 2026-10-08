import { KkExposureSweep, KkScreen } from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import type { LabView } from '../gallery-copy';
import { GALLERY_TITLE, LAB_ORIGIN } from '../gallery-copy';
import { useGalleryHub } from '../hooks/use-gallery-hub';
import { useUploadThread } from '../hooks/use-upload-thread';
import { GalleryInboxRoll } from './GalleryInboxRoll';
import { GallerySessionSection } from './GallerySessionSection';

interface GalleryHubPageProps {
  view: LabView;
}

export const GalleryHubPage: FC<GalleryHubPageProps> = ({ view }) => {
  const hub = useGalleryHub(view);
  const thread = useUploadThread(view === 'manage');
  const inbox =
    hub.inbox === null ? null : <GalleryInboxRoll inbox={hub.inbox} onOpen={hub.openInbox} />;
  const sections = hub.sections.map((section, order) => (
    <GallerySessionSection
      key={section.id}
      section={section}
      order={order}
      showsSelection={view === 'manage'}
      onOpen={hub.openAlbum}
    />
  ));

  return (
    <KkScreen
      kind="detail"
      title={GALLERY_TITLE}
      origin={LAB_ORIGIN}
      actions={hub.actions}
      thread={thread}
    >
      <KkExposureSweep scope="viewport">
        <Stack sx={{ rowGap: 3.5, pb: 4 }}>
          {inbox}
          {sections}
        </Stack>
      </KkExposureSweep>
    </KkScreen>
  );
};
