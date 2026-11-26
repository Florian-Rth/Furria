import { KkButton } from '@furria/ui/KkButton';
import { KkErrorState } from '@furria/ui/KkErrorState';
import { KkLightTable } from '@furria/ui/KkLightTable';
import { KkScreen } from '@furria/ui/KkScreen';
import type { FC } from 'react';
import { toScreenHelp } from '@/features/help/screen-help';
import { GALLERY_ORIGIN } from '@/features/session/app-sections';
import { INBOX_TITLE } from '../gallery-copy';
import { useGalleryInbox } from '../hooks/use-gallery-inbox';
import { INBOX_ERROR_TITLE, INBOX_RETRY_LABEL, KEY_HINT, LIGHT_TABLE_LABELS } from '../inbox-copy';
import { GalleryInboxFailedBar } from './GalleryInboxFailedBar';
import { GalleryInboxHelp } from './GalleryInboxHelp';
import { GalleryInboxSheet } from './GalleryInboxSheet';

export const GalleryInboxPage: FC = () => {
  const { baskets, inboxOwner, failure, failedItems, ...table } = useGalleryInbox();
  const failedBar =
    failedItems === null ? null : <GalleryInboxFailedBar failedItems={failedItems} />;
  const choosesInbox = inboxOwner.options.length > 0;
  const help = toScreenHelp(<GalleryInboxHelp choosesInbox={choosesInbox} />);
  const labels = { ...LIGHT_TABLE_LABELS, help: help.label };

  if (failure !== null) {
    const retry = (
      <KkButton loading={failure.retrying} onClick={failure.retry}>
        {INBOX_RETRY_LABEL}
      </KkButton>
    );
    return (
      <KkScreen kind="fullscreen" title={INBOX_TITLE} origin={GALLERY_ORIGIN} help={help}>
        <KkErrorState title={INBOX_ERROR_TITLE} description={failure.message} action={retry} />
        <GalleryInboxSheet baskets={baskets} inboxOwner={inboxOwner} />
      </KkScreen>
    );
  }

  return (
    <KkScreen kind="fullscreen" title={INBOX_TITLE} origin={GALLERY_ORIGIN} help={help}>
      {failedBar}
      <KkLightTable {...table} hint={KEY_HINT} labels={labels} />
      <GalleryInboxSheet baskets={baskets} inboxOwner={inboxOwner} />
    </KkScreen>
  );
};
