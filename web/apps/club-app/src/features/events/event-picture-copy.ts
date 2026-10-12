import type { KkBannerDeskLabels } from '@furria/ui';
import { PICTURE_COPY } from '@/features/pictures';

const copy = PICTURE_COPY.eventPicture;

export const EVENT_GALLERY_SHEET_ID = 'event-gallery-pick';
export const EVENT_GALLERY_TITLE = 'Bild aus der Galerie';
export const EVENT_GALLERY_NOTE =
  'Das Foto wird für die Veranstaltung kopiert. Das Album bleibt unverändert.';
export const EVENT_GALLERY_EMPTY = 'Kein Album mit fertigen Fotos.';

export const EVENT_PICTURE_LABELS: KkBannerDeskLabels = {
  upload: 'Hochladen',
  gallery: 'Aus der Galerie',
  emptyNote: copy.emptyNote,
  replace: 'Ersetzen',
  uploading: 'Wird hochgeladen',
  developing: 'Wird vorbereitet',
  failed: 'Hochladen fehlgeschlagen',
  retry: 'Erneut',
  crop: 'Zuschnitt',
  cropHint: 'Ziehen zum Verschieben',
  cropDone: 'Übernehmen',
  cropCancel: 'Abbrechen',
  remove: copy.removeLabel,
  removeConfirm: 'Wirklich entfernen',
  cropFrame: copy.frame,
};
