import type { KkScreenOrigin, KkShowcaseLabels } from '@furria/ui';
import { KkAlert, KkMeta, KkScreen, KkShowcase } from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { SELECTION_TITLE } from '../gallery-copy';
import { countLabel } from '../gallery-view';
import { useAlbumPhotoPicker } from '../hooks/use-album-photo-picker';
import { useAlbumSelection } from '../hooks/use-album-selection';
import type { AlbumDetails } from '../schemas';
import { MEDIA_CAPTION_MAX_LENGTH } from '../schemas';
import { selectionBarOf } from '../selection-bar';
import { pickableItemsOf, SOFT_SELECTION_SIZE, selectionSlotsOf } from '../selection-draft';
import { selectionPiecesOf } from '../selection-pieces';
import { AlbumPhotoPickerSheet } from './AlbumPhotoPickerSheet';
import { AlbumSelectionMarquee } from './AlbumSelectionMarquee';

const PICKER_SHEET_ID = 'gallery-selection-picker';
const SHOWCASE_LABELS: KkShowcaseLabels = {
  list: 'Auswahl für die Website',
  add: 'Fotos hinzufügen',
};
const HINT =
  'Am Griff ziehen oder mit den Pfeiltasten ordnen. Ohne Bildunterschrift liest die Website den grauen Text vor.';

interface AlbumSelectionViewProps {
  album: AlbumDetails;
}

const leadOf = (count: number): string => `${SELECTION_TITLE} · ${countLabel(count)}`;

const metaOf = (count: number): string =>
  count > SOFT_SELECTION_SIZE
    ? `Mehr als ein gutes Dutzend — die Website zeigt alle ${countLabel(count)}`
    : `Etwa ${SOFT_SELECTION_SIZE} Fotos zeigen den Abend am besten`;

export const AlbumSelectionView: FC<AlbumSelectionViewProps> = ({ album }) => {
  const selection = useAlbumSelection(album);
  const picker = useAlbumPhotoPicker(PICKER_SHEET_ID, selection.add);
  const slots = selectionSlotsOf(selection.draft, album.items);
  const pieces = selectionPiecesOf(album, slots);
  const pickable = pickableItemsOf(album.items, selection.draft);
  const origin: KkScreenOrigin = {
    label: album.title,
    to: '/gallery/$albumId',
    params: { albumId: String(album.albumId) },
  };
  const bar = selectionBarOf({
    publication: selection.publication,
    count: slots.length,
    isSaving: selection.isSaving,
    isPublishing: selection.isPublishing,
    save: selection.save,
    publish: selection.publish,
    withdraw: selection.withdraw,
  });
  const rejection = selection.rejection === null ? null : <KkAlert>{selection.rejection}</KkAlert>;
  const isPublished = selection.publication.kind === 'published';
  const lead = leadOf(slots.length);
  const meta = metaOf(slots.length);
  const nothingToAdd = pickable.length === 0;

  return (
    <KkScreen kind="working" title={SELECTION_TITLE} origin={origin} action={bar}>
      <Stack sx={{ rowGap: 2, pb: 4, minWidth: 0 }}>
        <AlbumSelectionMarquee
          isPublished={isPublished}
          hangKey={selection.hangKey}
          lead={lead}
          meta={meta}
        />
        {rejection}
        <KkShowcase
          pieces={pieces}
          labels={SHOWCASE_LABELS}
          announcement={selection.announcement}
          captionMaxLength={MEDIA_CAPTION_MAX_LENGTH}
          addDisabled={nothingToAdd}
          onMove={selection.move}
          onCaption={selection.caption}
          onRemove={selection.remove}
          onAdd={picker.open}
        />
        <KkMeta>{HINT}</KkMeta>
      </Stack>
      <AlbumPhotoPickerSheet picker={picker} items={pickable} />
    </KkScreen>
  );
};
