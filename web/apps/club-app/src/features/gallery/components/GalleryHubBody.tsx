import { KkButton, KkErrorState, KkExposureSweep } from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import type { GalleryHubState } from '../hooks/use-gallery-hub';
import { HUB_ERROR_TITLE, HUB_RETRY_LABEL, NEW_ALBUM_LABEL, toHubErrorMessage } from '../hub-copy';
import { inboxKeyOf, inboxOwnerOf } from '../hub-view';
import { GalleryHubEmpty } from './GalleryHubEmpty';
import { GalleryHubSkeleton } from './GalleryHubSkeleton';
import { GalleryInboxRoll } from './GalleryInboxRoll';
import { GallerySessionSection } from './GallerySessionSection';

interface GalleryHubBodyProps {
  state: GalleryHubState;
}

export const GalleryHubBody: FC<GalleryHubBodyProps> = ({ state }) => {
  const { hub } = state;
  const errorMessage = toHubErrorMessage(hub.error);
  const reload = (): void => {
    void hub.refetch();
  };

  if (hub.data === undefined) {
    if (errorMessage !== null) {
      const retry = <KkButton onClick={reload}>{HUB_RETRY_LABEL}</KkButton>;
      return <KkErrorState title={HUB_ERROR_TITLE} description={errorMessage} action={retry} />;
    }
    return <GalleryHubSkeleton />;
  }

  const rolls = state.inboxes.map((inbox) => {
    const key = inboxKeyOf(inboxOwnerOf(inbox));
    return <GalleryInboxRoll key={key} inbox={inbox} onOpen={state.openInbox} />;
  });
  const newAlbum = state.sorts ? (
    <KkButton
      size="small"
      variant="outlined"
      onClick={state.openNewAlbum}
      sx={{ alignSelf: 'flex-start' }}
    >
      {NEW_ALBUM_LABEL}
    </KkButton>
  ) : null;
  const sections = hub.data.sections.map((section, order) => (
    <GallerySessionSection
      key={section.sessionStartYear ?? 'free'}
      section={section}
      order={order}
      showsSelection={state.showsSelection}
      now={state.now}
      onOpen={state.openAlbum}
    />
  ));
  const isEmpty = hub.data.sections.length === 0 && state.inboxes.length === 0;
  const empty = isEmpty ? (
    <GalleryHubEmpty sorts={state.sorts} onUpload={state.openUpload} />
  ) : null;

  return (
    <KkExposureSweep scope="viewport">
      <Stack sx={{ rowGap: 3.5, pb: 4 }}>
        {rolls}
        {newAlbum}
        {sections}
        {empty}
      </Stack>
    </KkExposureSweep>
  );
};
