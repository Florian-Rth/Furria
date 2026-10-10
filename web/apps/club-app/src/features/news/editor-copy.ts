import type { TeaserSurface } from './teaser-cuts';
import type { TextBlockKind } from './text-commands';
import type { NewsMentionKind } from './types';

export const NEW_POST_TITLE = 'Neue Meldung';
export const EDITOR_LOADING = 'Die Meldung wird geladen';
export const EDITOR_ERROR_TITLE = 'MELDUNG NICHT GELADEN';
export const TITLE_PLACEHOLDER = 'Titel der Meldung';
export const TEASER_PLACEHOLDER = 'Vorspann: Wer hat was, wann und wo getan? Ein, zwei Sätze.';
export const TEXT_PLACEHOLDER =
  'Text der Meldung. @ erwähnt eine Gruppe oder ein Vorstandsmitglied.';
export const CATEGORY_CHOOSE = 'Kategorie wählen';
export const CATEGORY_MENU_LABEL = 'Kategorie';
export const TITLE_FIELD_LABEL = 'Titel';
export const TEASER_FIELD_LABEL = 'Vorspann – erscheint auf Karten und in Link-Vorschauen';
export const TEXT_FIELD_LABEL = 'Text der Meldung';
export const BYLINE_DRAFT = 'Entwurf';
export const BYLINE_AUTHOR = 'von';
export const ADDRESS_FIXED = 'Adresse steht fest';
export const ADDRESS_PENDING = 'Adresse und Datum entstehen beim ersten Veröffentlichen';
export const ADDRESS_PLACEHOLDER = '…';

export const TEASER_CUT_WORDS: Record<TeaserSurface, string> = {
  card: 'Karte',
  lead: 'Aufmacher',
  whatsapp: 'WhatsApp',
};

export const RAIL_LABEL = 'Format';
export const BLOCK_WORDS: Record<TextBlockKind, string> = {
  paragraph: 'Absatz',
  heading: 'Zwischenüberschrift',
  list: 'Liste',
};
export const BOLD_WORD = 'Fett';
export const LINK_WORD = 'Link';
export const MENTION_WORD = 'Erwähnen';

export const MENTION_GROUPS = 'Gruppen';
export const MENTION_BOARD = 'Vorstand';
export const MENTION_KIND_WORDS: Record<NewsMentionKind, string> = {
  group: 'Gruppe',
  person: 'Vorstand',
};
export const MENTION_EMPTY = 'Niemand gefunden';
export const MENTION_LIST_LABEL = 'Erwähnen';
export const MENTION_LABEL_FIELD = 'So steht es im Satz';
export const MENTION_TARGET = 'Verweist auf';
export const MENTION_REMOVE = 'Erwähnung entfernen';
export const MENTION_DONE = 'Fertig';
export const MENTION_NOT_PUBLIC = 'nicht öffentlich – erscheint als Text';

export const LINK_SHEET_ID = 'news-link';
export const LINK_SHEET_TITLE = 'Link setzen';
export const LINK_FIELD = 'Adresse (https://…)';
export const LINK_APPLY = 'Link setzen';
export const LINK_REMOVE = 'Link entfernen';
export const LINK_INVALID = 'Nur Adressen mit https:// oder http://';

export const PICTURE_UPLOAD = 'Hochladen';
export const PICTURE_EMPTY_NOTE = 'Ohne Bild zeigt die Website dieses Plakat.';
export const PICTURE_FROM_GALLERY = 'Aus der Galerie';
export const PICTURE_CROP = 'Zuschnitt';
export const PICTURE_CROP_DONE = 'Übernehmen';
export const PICTURE_CROP_CANCEL = 'Abbrechen';
export const PICTURE_CROP_HINT = 'Ziehen zum Verschieben';
export const PICTURE_REPLACE = 'Ersetzen';
export const PICTURE_REMOVE = 'Bild entfernen';
export const PICTURE_REMOVE_CONFIRM = 'Wirklich entfernen';
export const PICTURE_UPLOADING = 'Wird hochgeladen';
export const PICTURE_DEVELOPING = 'Wird entwickelt';
export const PICTURE_FAILED = 'Hochladen fehlgeschlagen';
export const PICTURE_RETRY = 'Erneut';
export const PICTURE_ALT = 'Bild der Meldung';
export const PICTURE_CROP_LABELS = { frame: 'Bildausschnitt verschieben', zoom: 'Zoom' };
export const CAPTION_PLACEHOLDER = 'Bildunterschrift oder Fotonachweis (optional)';
export const CAPTION_LABEL = 'Bildunterschrift';
export const GALLERY_SHEET_ID = 'news-gallery-pick';
export const GALLERY_SHEET_TITLE = 'Bild aus der Galerie';
export const GALLERY_COPY_NOTE = 'Das Bild wird für die Meldung kopiert.';
export const GALLERY_EMPTY = 'Kein veröffentlichtes Album mit Fotos.';
export const galleryPhotoLabelOf = (albumTitle: string, index: number): string =>
  `${albumTitle}, Foto ${index + 1}`;
export const PICTURE_UPLOAD_FAILED = 'Das Bild konnte nicht hochgeladen werden.';
export const PICTURE_ACTION_FAILED = 'Das Bild konnte nicht geändert werden.';

export const TIE_OFFER = 'Anheften';
export const TIE_EVENT_EMPTY = 'Veranstaltung';
export const TIE_ALBUM_EMPTY = 'Album';
export const TIE_EVENT_SHEET_ID = 'news-tie-event';
export const TIE_ALBUM_SHEET_ID = 'news-tie-album';
export const TIE_EVENT_SHEET_TITLE = 'Veranstaltung anheften';
export const TIE_ALBUM_SHEET_TITLE = 'Album anheften';
export const TIE_RELEASE = 'Lösen';
export const TIE_DROPPED = 'fällt auf der Website weg';
export const TIE_PHOTOS = 'Fotos';
export const TIE_CANCELLED = 'abgesagt';
export const SHEET_CLOSE = 'Schließen';

export const SAVED_AT = 'gespeichert';
export const SAVING = 'speichert …';
export const SAVE_FAILED = 'nicht gespeichert · wird wiederholt';
export const FOREIGN_SAVE = (name: string, time: string): string =>
  `Zwischendurch hat ${name} gespeichert · ${time} — deine Fassung gilt`;
export const READINESS_LABEL = 'Zum Veröffentlichen fehlt';
export const READY_LABEL = 'Bereit zum Veröffentlichen';

export const PUBLISH_FIRST = 'Veröffentlichen';
export const PUBLISH_CHANGES = 'Änderungen veröffentlichen';
export const PUBLISH_AGAIN = 'Wieder veröffentlichen';
export const WITHDRAW = 'Zurückziehen';
export const DISCARD = 'Verwerfen';
export const DELETE = 'Löschen';
export const SHOW_LIVE = 'Live-Fassung';
export const SHOW_WORKING = 'Änderungen';
export const VERSION_TOGGLE_LABEL = 'Fassung';

export const GONE_TITLE = 'Diese Meldung wurde gelöscht';
export const GONE_TEXT =
  'Jemand hat sie gelöscht, während du geschrieben hast. Kopiere deinen Text, bevor du gehst.';
export const GONE_COPY = 'Text kopieren';

export const PUBLISH_FAILED = 'Veröffentlichen fehlgeschlagen – nichts ist live gegangen.';
export const ACTION_FAILED = 'Das hat nicht geklappt. Versuch es noch einmal.';

export interface LifecycleCopy {
  eyebrow: string;
  question: string;
  explanation: string;
  confirm: string;
  tone: 'neutral' | 'danger';
}

export const LIFECYCLE_COPY: Record<'withdraw' | 'discard' | 'delete', LifecycleCopy> = {
  withdraw: {
    eyebrow: 'Aktuelles',
    question: 'Meldung zurückziehen?',
    explanation:
      'Die Website zeigt sie ab sofort nicht mehr. Du kannst sie jederzeit wieder veröffentlichen – Adresse und Datum bleiben.',
    confirm: 'Zurückziehen',
    tone: 'danger',
  },
  discard: {
    eyebrow: 'Aktuelles',
    question: 'Änderungen verwerfen?',
    explanation:
      'Die Website zeigt weiter die Live-Fassung. Deine offenen Änderungen sind danach weg.',
    confirm: 'Verwerfen',
    tone: 'danger',
  },
  delete: {
    eyebrow: 'Aktuelles',
    question: 'Meldung löschen?',
    explanation: 'Für immer, ohne Papierkorb. Das Bild wird mitgelöscht, die Adresse wird frei.',
    confirm: 'Löschen',
    tone: 'danger',
  },
};

export const WITHDRAW_ADOPTS = 'Offene Änderungen werden dabei übernommen.';
export const DIALOG_CANCEL = 'Abbrechen';
export const DIALOG_CLOSE = 'Schließen';
