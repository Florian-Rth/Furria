import type { KkCropFrameLabels, KkCropGuide } from '@furria/ui';
import type { MediaItemState } from '@/lib/api/schemas';
import type { UploadFailure } from '@/lib/media/upload-failure';
import type { PictureKind } from './picture-target';

export interface PictureCopy {
  title: string;
  noun: string;
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
  eventPicture: {
    title: 'Veranstaltungsbild',
    noun: 'Veranstaltungsbild',
    guide: 'none',
    frame: {
      frame:
        'Ausschnitt des Veranstaltungsbilds – ziehen zum Verschieben, Plus und Minus zum Zoomen',
      zoom: 'Zoom',
    },
    emptyNote: 'Ohne Bild zeigen App und Website eine Farbfläche mit den gekreuzten Besen.',
    removeLabel: 'Bild entfernen',
    removeQuestion: 'Veranstaltungsbild entfernen?',
    removeExplanation:
      'Das Bild wird gelöscht. Die Veranstaltung zeigt wieder die Farbfläche – in der App und auf der Website.',
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

const UPLOAD_FAILURE_MESSAGES: Record<UploadFailure, string> = {
  tooLarge: 'Das Foto ist zu groß. Erlaubt sind bis zu 100 MB.',
  notAccepted: 'Das ist kein unterstütztes Foto. Erlaubt sind JPEG, HEIC, PNG und WebP.',
  notAllowed: 'Dieses Bild darfst du nicht ändern.',
  gone: 'Diesen Eintrag gibt es nicht mehr.',
  interrupted: 'Das Hochladen wurde unterbrochen. Versuch es bitte noch einmal.',
};

export const toUploadFailureMessage = (failure: UploadFailure): string =>
  UPLOAD_FAILURE_MESSAGES[failure];

export const toUploadProgressLine = (share: number): string =>
  `Lädt hoch … ${Math.round(share * 100)} %`;

export const UNREADABLE_PHOTO_NOTE =
  'Dieses Foto kann hier nicht angezeigt werden. Es wird mittig zugeschnitten hochgeladen – den Ausschnitt kannst du danach ändern.';
