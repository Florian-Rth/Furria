import type { QueryErrorKind } from '@/lib/query-error';
import { toQueryErrorMessage } from '@/lib/query-error';
import type { HubAlbumMark } from './hub-view';

export const HUB_LOADING_LABEL = 'Galerie wird geladen';
export const HUB_ERROR_TITLE = 'GALERIE NICHT GELADEN';
export const HUB_RETRY_LABEL = 'Erneut laden';
export const HUB_EMPTY_TITLE = 'NOCH KEIN FILM';
export const HUB_EMPTY_DESCRIPTION =
  'Sobald die ersten Alben stehen, liegen sie hier als Kontaktbögen.';
export const HUB_EMPTY_SORTER_DESCRIPTION =
  'Lade den ersten Abend hoch – er landet in deinem Eingang, dort sortierst du ihn in Alben.';
export const NEW_ALBUM_LABEL = 'Neues Album';
export const INBOX_OPEN_TRAIL = 'Sichten ▸';
export const OWNERLESS_INBOX = 'ohne Fotograf';
export const PROCESSING_NOTE = 'entwickelt sich';

const HUB_ERROR_MESSAGES: Record<QueryErrorKind, string> = {
  unreachable: 'Keine Verbindung zum Server. Prüfe deine Internetverbindung.',
  unexpected: 'Die Galerie konnte nicht geladen werden.',
  rejected: 'Der Server hat die Anfrage abgelehnt.',
};

export const toHubErrorMessage = (error: Error | null): string | null =>
  toQueryErrorMessage(error, HUB_ERROR_MESSAGES);

export const markTrailOf = (mark: HubAlbumMark): string | undefined => {
  switch (mark.kind) {
    case 'published':
      return 'Veröffentlicht';
    case 'new':
      return 'Neu';
    case 'selection':
      return `Auswahl ${mark.count}`;
    case 'none':
      return undefined;
  }
};
