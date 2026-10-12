import type { KkContactStripFrame } from '@furria/ui';
import { KkContactStrip } from '@furria/ui';
import type { FC } from 'react';
import { INBOX_TITLE } from '../gallery-copy';
import { clockLabel, countLabel, dayLabel, personNameOf, shownSourceOf } from '../gallery-view';
import { INBOX_OPEN_TRAIL, OWNERLESS_INBOX } from '../hub-copy';
import { inboxOwnerOf } from '../hub-view';
import type { InboxSummary } from '../schemas';
import type { InboxOwner } from '../types';

interface GalleryInboxRollProps {
  inbox: InboxSummary;
  onOpen: (owner: InboxOwner) => void;
}

const metaOf = (inbox: InboxSummary): string =>
  `${countLabel(inbox.photos + inbox.videos)} ungesichtet · ${dayLabel(inbox.latestUploadedAt) ?? ''}`;

const titleOf = (inbox: InboxSummary): string =>
  `${INBOX_TITLE} · ${inbox.uploader === null ? OWNERLESS_INBOX : personNameOf(inbox.uploader)}`;

export const GalleryInboxRoll: FC<GalleryInboxRollProps> = ({ inbox, onOpen }) => {
  const owner = inboxOwnerOf(inbox);
  const frames: KkContactStripFrame[] = inbox.samples.map((item, position) => ({
    id: String(item.mediaItemId),
    label: `${INBOX_TITLE}, Bild ${position + 1}`,
    source: shownSourceOf(item),
    edge: clockLabel(item.capturedAt) || `#${position + 1}`,
  }));
  const open = (): void => onOpen(owner);
  const meta = metaOf(inbox);
  const title = titleOf(inbox);

  return (
    <KkContactStrip
      title={title}
      titleLabel={`${title} sichten`}
      meta={meta}
      trail={INBOX_OPEN_TRAIL}
      tone="red"
      frames={frames}
      onOpen={open}
    />
  );
};
