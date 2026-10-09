import type { KkCropFrameLabels, KkCropGuide } from '@furria/ui';
import { kkTokens } from '@furria/ui';
import type { MediaItemState } from '@/lib/api/schemas';
import type { PictureKind, PictureUploadFailure } from './picture-target';

export interface PictureCopy {
  title: string;
  noun: string;
  aspectRatio: string;
  guide: KkCropGuide;
  frame: KkCropFrameLabels;
  emptyNote: string;
  removeLabel: string;
  removeQuestion: string;
  removeExplanation: string;
}

export const PICTURE_COPY: Record<PictureKind, PictureCopy> = {
  portrait: {
    title: 'Porträt',
    noun: 'Porträt',
    aspectRatio: kkTokens.aspectRatio.portrait,
    guide: 'circle',
    frame: {
      frame: 'Ausschnitt des Porträts – ziehen zum Verschieben, Plus und Minus zum Zoomen',
      zoom: 'Zoom',
    },
    emptyNote:
      'Noch kein Porträt. Wo ein Bild fehlt, stehen die Initialen. Der Kreis zeigt, was in Listen zu sehen ist.',
    removeLabel: 'Porträt entfernen',
    removeQuestion: 'Porträt entfernen?',
    removeExplanation:
      'Das Bild wird gelöscht. Wo es zu sehen war, stehen wieder die Initialen – auch auf der Website.',
  },
  groupPicture: {
    title: 'Gruppenbild',
    noun: 'Gruppenbild',
    aspectRatio: kkTokens.aspectRatio.groupPicture,
    guide: 'none',
    frame: {
      frame: 'Ausschnitt des Gruppenbilds – ziehen zum Verschieben, Plus und Minus zum Zoomen',
      zoom: 'Zoom',
    },
    emptyNote: 'Noch kein Gruppenbild. Bis dahin trägt die Gruppe ihre Farbe.',
    removeLabel: 'Gruppenbild entfernen',
    removeQuestion: 'Gruppenbild entfernen?',
    removeExplanation:
      'Das Bild wird gelöscht. Die Gruppe zeigt wieder ihre Farbe – im Hub und auf der Website.',
  },
};

export const PICTURE_ACTION_LABELS = {
  choose: 'Foto wählen',
  chooseOther: 'Anderes Foto',
  recrop: 'Ausschnitt ändern',
  upload: 'Hochladen',
  saveCrop: 'Ausschnitt speichern',
  cancel: 'Abbrechen',
  close: 'Schließen',
} as const;

export const PICTURE_STATE_NOTES: Record<MediaItemState, string | null> = {
  processing: 'Das Bild wird gerade vorbereitet. Das dauert nur einen Moment.',
  ready: null,
  failed: 'Dieses Bild ließ sich nicht verarbeiten. Wähl bitte ein anderes Foto.',
};

const UPLOAD_FAILURE_MESSAGES: Record<PictureUploadFailure, string> = {
  tooLarge: 'Das Foto ist zu groß. Erlaubt sind bis zu 100 MB.',
  notAPhoto: 'Das ist kein unterstütztes Foto. Erlaubt sind JPEG, HEIC, PNG und WebP.',
  notAllowed: 'Dieses Bild darfst du nicht ändern.',
  gone: 'Diesen Eintrag gibt es nicht mehr.',
  interrupted: 'Das Hochladen wurde unterbrochen. Versuch es bitte noch einmal.',
};

export const toUploadFailureMessage = (failure: PictureUploadFailure): string =>
  UPLOAD_FAILURE_MESSAGES[failure];

export const toUploadProgressLine = (share: number): string =>
  `Lädt hoch … ${Math.round(share * 100)} %`;

export const UNREADABLE_PHOTO_NOTE =
  'Dieses Foto kann hier nicht angezeigt werden. Es wird mittig zugeschnitten hochgeladen – den Ausschnitt kannst du danach ändern.';
