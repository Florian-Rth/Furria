import type { KkLightTableLabels } from '@furria/ui';
import { KkLightTable, KkScreen } from '@furria/ui';
import type { FC } from 'react';
import { GALLERY_ORIGIN, INBOX_TITLE } from '../gallery-copy';
import { useGalleryInbox } from '../hooks/use-gallery-inbox';

const LIGHT_TABLE_LABELS: KkLightTableLabels = {
  dialog: 'Eingang sichten',
  close: 'Schließen',
  undo: 'Rückgängig',
  reject: 'Verwerfen',
  confirm: 'Ja',
  cancel: 'Abbrechen',
};

const KEY_HINT = '← → blättern · X verwerfen · 1–3 ablegen · ⇧ ganze Szene · Z zurück';

interface GalleryInboxPageProps {
  left: number | undefined;
}

export const GalleryInboxPage: FC<GalleryInboxPageProps> = ({ left }) => {
  const inbox = useGalleryInbox(left);

  return (
    <KkScreen kind="fullscreen" title={INBOX_TITLE} origin={GALLERY_ORIGIN}>
      <KkLightTable {...inbox} hint={KEY_HINT} labels={LIGHT_TABLE_LABELS} />
    </KkScreen>
  );
};
