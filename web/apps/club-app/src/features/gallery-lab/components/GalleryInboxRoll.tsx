import type { KkContactStripFrame } from '@furria/ui';
import { KkContactStrip } from '@furria/ui';
import type { FC } from 'react';
import { INBOX_TITLE } from '../gallery-copy';
import type { HubAlbum } from '../gallery-view';
import { countLabel, dayLabel } from '../gallery-view';
import { labSourceOf } from '../lab-gallery-data';

const ROLL_FRAMES = 9;

interface GalleryInboxRollProps {
  inbox: HubAlbum;
  onOpen: () => void;
}

export const GalleryInboxRoll: FC<GalleryInboxRollProps> = ({ inbox, onOpen }) => {
  const frames: KkContactStripFrame[] = inbox.items.slice(0, ROLL_FRAMES).map((item) => ({
    id: String(item.id),
    label: `${INBOX_TITLE}, Bild ${item.number}`,
    source: labSourceOf(item.photo),
    edge: `#${item.number}`,
  }));
  const meta = `${countLabel(inbox.items.length)} ungesichtet · ${inbox.album.uploaders.join(', ')} · ${dayLabel(inbox.album.entryDate) ?? ''}`;

  return (
    <KkContactStrip
      title={INBOX_TITLE}
      titleLabel={`${INBOX_TITLE} sichten`}
      meta={meta}
      trail="Sichten ▸"
      tone="red"
      frames={frames}
      onOpen={onOpen}
    />
  );
};
