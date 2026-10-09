import { KkLightTable, KkScreen } from '@furria/ui';
import type { FC } from 'react';
import { GALLERY_ORIGIN } from '@/features/session';
import { INBOX_TITLE } from '../gallery-copy';
import { useGalleryInbox } from '../hooks/use-gallery-inbox';
import { KEY_HINT, LIGHT_TABLE_LABELS } from '../inbox-copy';
import { GalleryInboxSheet } from './GalleryInboxSheet';

export const GalleryInboxPage: FC = () => {
  const { baskets, inboxOwner, ...table } = useGalleryInbox();

  return (
    <KkScreen kind="fullscreen" title={INBOX_TITLE} origin={GALLERY_ORIGIN}>
      <KkLightTable {...table} hint={KEY_HINT} labels={LIGHT_TABLE_LABELS} />
      <GalleryInboxSheet baskets={baskets} inboxOwner={inboxOwner} />
    </KkScreen>
  );
};
