import { KkButton } from '@furria/ui/KkButton';
import { KkErrorState } from '@furria/ui/KkErrorState';
import { KkExposureSweep } from '@furria/ui/KkExposureSweep';
import { KkRetryAlert } from '@furria/ui/KkRetryAlert';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { WebsiteHubEntry } from '@/features/website-pictures/components/WebsiteHubEntry';
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
      const retry = (
        <KkButton loading={hub.isFetching} onClick={reload}>
          {HUB_RETRY_LABEL}
        </KkButton>
      );
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
  const inboxFailure =
    state.inboxFailure === null ? null : (
      <KkRetryAlert
        message={state.inboxFailure}
        retrying={state.inboxRetrying}
        onRetry={state.retryInboxes}
        retryLabel={HUB_RETRY_LABEL}
      />
    );
  const isEmpty =
    hub.data.sections.length === 0 && state.inboxes.length === 0 && state.inboxFailure === null;
  const empty = isEmpty ? (
    <GalleryHubEmpty sorts={state.sorts} onUpload={state.openUpload} />
  ) : null;

  return (
    <KkExposureSweep scope="viewport">
      <Stack sx={{ rowGap: 3.5, pb: 4 }}>
        {inboxFailure}
        {rolls}
        {newAlbum}
        {sections}
        {empty}
        <WebsiteHubEntry />
      </Stack>
    </KkExposureSweep>
  );
};
