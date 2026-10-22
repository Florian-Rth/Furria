import type { KkShowcasePieceData } from '@furria/ui/KkShowcasePiece';
import { frameStateOf, shownSourceOf } from './gallery-view';
import type { AlbumDetails } from './schemas';
import type { SelectionSlot } from './selection-draft';
import { altFallbackOf, marksTitlePhoto } from './selection-draft';

const TITLE_PHOTO_BADGE = 'Titelbild';

export const selectionPiecesOf = (
  album: AlbumDetails,
  slots: readonly SelectionSlot[],
): KkShowcasePieceData[] =>
  slots.map(({ entry, item, position }) => {
    const altFallback = altFallbackOf(album.title, position);
    const caption = entry.caption.trim();
    return {
      id: String(entry.mediaItemId),
      label: caption === '' ? altFallback : caption,
      source: shownSourceOf(item),
      state: frameStateOf(item),
      badge: marksTitlePhoto(album, position) ? TITLE_PHOTO_BADGE : undefined,
      caption: entry.caption,
      captionPlaceholder: altFallback,
      captionLabel: `Bildunterschrift zu Foto ${position}`,
      handleLabel: `Foto ${position} von ${slots.length} verschieben`,
      removeLabel: `Foto ${position} aus der Auswahl nehmen`,
    };
  });
