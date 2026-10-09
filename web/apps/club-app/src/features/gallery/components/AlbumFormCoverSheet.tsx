import type { KkSheetAction } from '@furria/ui';
import { KkFrame, KkFrameGrid, KkMeta, KkSheet } from '@furria/ui';
import type { FC } from 'react';
import { AUTOMATIC_COVER } from '../album-form';
import { thumbSourceOf } from '../gallery-view';
import type { AlbumFormControl } from '../hooks/use-album-form';
import { COVER_SHEET_ID } from '../hooks/use-album-form';
import type { AlbumItem } from '../schemas';

const TITLE = 'Titelbild wählen';
const CLOSE_LABEL = 'Schließen';
const AUTOMATIC_LABEL = 'Automatisch wählen lassen';
const NO_PHOTOS = 'Das Album hat noch keine fertigen Fotos.';

interface AlbumFormCoverSheetProps {
  items: readonly AlbumItem[];
  control: AlbumFormControl;
}

export const AlbumFormCoverSheet: FC<AlbumFormCoverSheetProps> = ({ items, control }) => {
  const photos = items.filter((item) => item.kind === 'photo' && item.state === 'ready');
  const frames = photos.map((item, index) => {
    const choose = (): void => control.chooseCover(String(item.mediaItemId));
    const label = `Foto ${index + 1} als Titelbild`;
    const source = thumbSourceOf(item.urls);
    const isChosen = control.values.cover === String(item.mediaItemId);
    return (
      <KkFrame
        key={item.mediaItemId}
        label={label}
        source={source}
        selected={isChosen}
        onSelect={choose}
      />
    );
  });
  const chooseAutomatic = (): void => control.chooseCover(AUTOMATIC_COVER);
  const automatic: KkSheetAction = {
    label: AUTOMATIC_LABEL,
    onClick: chooseAutomatic,
    disabled: control.values.cover === AUTOMATIC_COVER,
  };
  const body =
    photos.length === 0 ? (
      <KkMeta>{NO_PHOTOS}</KkMeta>
    ) : (
      <KkFrameGrid label={TITLE}>{frames}</KkFrameGrid>
    );

  return (
    <KkSheet id={COVER_SHEET_ID} title={TITLE} closeLabel={CLOSE_LABEL}>
      <KkSheet.Body>{body}</KkSheet.Body>
      <KkSheet.Actions secondary={automatic} />
    </KkSheet>
  );
};
