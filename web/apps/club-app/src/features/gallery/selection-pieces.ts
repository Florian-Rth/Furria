import type { KkShowcasePieceData } from '@furria/ui';
import { thumbSourceOf } from './gallery-view';
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
      source: thumbSourceOf(item.urls),
      badge: marksTitlePhoto(album, position) ? TITLE_PHOTO_BADGE : undefined,
      caption: entry.caption,
      captionPlaceholder: altFallback,
      captionLabel: `Bildunterschrift zu Foto ${position}`,
      handleLabel: `Foto ${position} von ${slots.length} verschieben`,
      removeLabel: `Foto ${position} aus der Auswahl nehmen`,
    };
  });
