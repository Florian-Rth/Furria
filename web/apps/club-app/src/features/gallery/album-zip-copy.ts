import { byteSizeLabel } from './download/media-download';

export const ZIP_CONFIRM_EYEBROW = 'ZIP-Download';
export const ZIP_CONFIRM_QUESTION = 'Ganzes Album als ZIP laden?';
export const ZIP_CONFIRM_EXPLANATION =
  'Alle Originale in voller Größe. Die ZIP lädt im Hintergrund, du kannst die App solange weiter nutzen – lass sie dabei geöffnet.';
export const ZIP_CONFIRM_LABEL = 'ZIP laden';
export const ZIP_CANCEL_LABEL = 'Abbrechen';
export const ZIP_CLOSE_LABEL = 'Schließen';
export const ZIP_FACT_ALBUM = 'Album';
export const ZIP_FACT_CONTENT = 'Inhalt';
export const ZIP_FACT_SIZE = 'Größe';
export const ZIP_FACT_TARGET = 'Ablage';

export const zipSizeLabel = (bytes: number): string => `ca. ${byteSizeLabel(bytes)}`;
