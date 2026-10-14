import type { QueryErrorKind } from '@/lib/query-error';
import { toQueryErrorMessage } from '@/lib/query-error';

export const GALLERY_PICK_CLOSE = 'Schließen';

export const galleryPhotoLabelOf = (albumTitle: string, index: number, count: number): string =>
  `${albumTitle}, Foto ${index + 1} von ${count}`;

export const PICK_RETRY = 'Erneut laden';
export const ALBUMS_LOADING = 'Alben werden geladen';
export const PHOTOS_LOADING = 'Fotos werden geladen';

const ALBUMS_LOAD_ERRORS: Record<QueryErrorKind, string> = {
  unreachable: 'Keine Verbindung zum Server. Prüfe deine Internetverbindung.',
  unexpected: 'Die Alben konnten nicht geladen werden.',
  rejected: 'Der Server hat die Anfrage abgelehnt.',
};

const PHOTOS_LOAD_ERRORS: Record<QueryErrorKind, string> = {
  unreachable: 'Keine Verbindung zum Server. Prüfe deine Internetverbindung.',
  unexpected: 'Die Fotos dieses Albums konnten nicht geladen werden.',
  rejected: 'Der Server hat die Anfrage abgelehnt.',
};

export const albumsLoadErrorOf = (error: Error | null): string | null =>
  toQueryErrorMessage(error, ALBUMS_LOAD_ERRORS);

export const photosLoadErrorOf = (error: Error | null): string | null =>
  toQueryErrorMessage(error, PHOTOS_LOAD_ERRORS);
