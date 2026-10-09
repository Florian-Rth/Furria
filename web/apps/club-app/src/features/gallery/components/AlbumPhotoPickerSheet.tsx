import type { KkSheetAction } from '@furria/ui';
import { KkFrame, KkFrameGrid, KkMeta, KkSheet } from '@furria/ui';
import type { FC } from 'react';
import { thumbSourceOf } from '../gallery-view';
import type { AlbumPhotoPicker } from '../hooks/use-album-photo-picker';
import type { AlbumItem } from '../schemas';

const TITLE = 'Fotos für die Auswahl';
const CLOSE_LABEL = 'Schließen';
const NOTHING_LEFT = 'Alle fertigen Fotos des Albums sind schon in der Auswahl.';

interface AlbumPhotoPickerSheetProps {
  picker: AlbumPhotoPicker;
  items: readonly AlbumItem[];
}

const confirmLabelOf = (count: number): string =>
  count === 0 ? 'Fotos antippen' : `${count} ${count === 1 ? 'Foto' : 'Fotos'} hinzufügen`;

export const AlbumPhotoPickerSheet: FC<AlbumPhotoPickerSheetProps> = ({ picker, items }) => {
  const frames = items.map((item, index) => {
    const toggle = (): void => picker.toggle(item.mediaItemId);
    const label = `Foto ${index + 1}`;
    const source = thumbSourceOf(item.urls);
    const isPicked = picker.picked.has(item.mediaItemId);
    return (
      <KkFrame
        key={item.mediaItemId}
        label={label}
        source={source}
        selected={isPicked}
        onSelect={toggle}
      />
    );
  });
  const body =
    items.length === 0 ? (
      <KkMeta>{NOTHING_LEFT}</KkMeta>
    ) : (
      <KkFrameGrid label={TITLE}>{frames}</KkFrameGrid>
    );
  const pickedCount = picker.picked.size;
  const confirm: KkSheetAction = {
    label: confirmLabelOf(pickedCount),
    onClick: picker.confirm,
    disabled: pickedCount === 0,
  };

  return (
    <KkSheet id={picker.sheetId} title={TITLE} closeLabel={CLOSE_LABEL}>
      <KkSheet.Body>{body}</KkSheet.Body>
      <KkSheet.Actions primary={confirm} />
    </KkSheet>
  );
};
