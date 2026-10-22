import type { KkBannerDeskLabels } from '@furria/ui/banner-desk-types';
import type { KkCropFrameLabels, KkCropGuide } from '@furria/ui/KkCropFrame';
import type { UploadFailure } from '@/lib/media/upload-failure';
import type { PictureKind } from './picture-target';

export interface PictureCopy {
  title: string;
  guide: KkCropGuide;
  frame: KkCropFrameLabels;
  emptyNote: string;
  removeLabel: string;
}

export const PICTURE_COPY: Record<PictureKind, PictureCopy> = {
  portrait: {
    title: 'Porträt',
    guide: 'circle',
    frame: {
      frame: 'Ausschnitt des Porträts – ziehen zum Verschieben, Plus und Minus zum Zoomen',
      zoom: 'Zoom',
    },
    emptyNote: 'Noch kein Porträt. Bis dahin stehen die Initialen.',
    removeLabel: 'Porträt entfernen',
  },
  groupPicture: {
    title: 'Gruppenbild',
    guide: 'none',
    frame: {
      frame: 'Ausschnitt des Gruppenbilds – ziehen zum Verschieben, Plus und Minus zum Zoomen',
      zoom: 'Zoom',
    },
    emptyNote: 'Noch kein Gruppenbild. Bis dahin trägt die Gruppe ihre Farbe.',
    removeLabel: 'Gruppenbild entfernen',
  },
  eventPicture: {
    title: 'Veranstaltungsbild',
    guide: 'none',
    frame: {
      frame:
        'Ausschnitt des Veranstaltungsbilds – ziehen zum Verschieben, Plus und Minus zum Zoomen',
      zoom: 'Zoom',
    },
    emptyNote: 'Ohne Bild zeigen App und Website einen gestreiften Platzhalter.',
    removeLabel: 'Bild entfernen',
  },
};

const UPLOAD_FAILURE_MESSAGES: Record<UploadFailure, string> = {
  tooLarge: 'Das Foto ist zu groß. Erlaubt sind bis zu 100 MB.',
  notAccepted: 'Das ist kein unterstütztes Foto. Erlaubt sind JPEG, HEIC, PNG und WebP.',
  notAllowed: 'Dieses Bild darfst du nicht ändern.',
  gone: 'Diesen Eintrag gibt es nicht mehr.',
  interrupted: 'Das Hochladen wurde unterbrochen. Versuch es bitte noch einmal.',
};

export const toUploadFailureMessage = (failure: UploadFailure): string =>
  UPLOAD_FAILURE_MESSAGES[failure];

const toDeskLabels = (copy: PictureCopy): KkBannerDeskLabels => ({
  upload: 'Hochladen',
  gallery: 'Aus der Galerie',
  emptyNote: copy.emptyNote,
  replace: 'Ersetzen',
  uploading: 'Wird hochgeladen',
  developing: 'Wird vorbereitet',
  stalled: 'Vorbereiten dauert ungewöhnlich lange',
  failed: 'Hochladen fehlgeschlagen',
  retry: 'Erneut',
  crop: 'Zuschnitt',
  cropHint: 'Ziehen zum Verschieben',
  cropDone: 'Übernehmen',
  cropCancel: 'Abbrechen',
  remove: copy.removeLabel,
  removeConfirm: 'Wirklich entfernen',
  cropFrame: copy.frame,
});

export const PICTURE_DESK_LABELS: Record<PictureKind, KkBannerDeskLabels> = {
  portrait: toDeskLabels(PICTURE_COPY.portrait),
  groupPicture: toDeskLabels(PICTURE_COPY.groupPicture),
  eventPicture: toDeskLabels(PICTURE_COPY.eventPicture),
};
