import { svgRootTagOf } from '@furria/ui/svg-root';

export const STAGE_ARTWORK_MAX_LENGTH = 500_000;

const SVG_MIME_TYPE = 'image/svg+xml';
const SVG_EXTENSION = '.svg';

export type StageArtworkFileRejection = 'wrong-type' | 'too-large' | 'not-svg';

const REJECTION_MESSAGES: Record<StageArtworkFileRejection, string> = {
  'wrong-type': 'Die Bühnenzeichnung muss eine SVG-Datei sein.',
  'too-large': 'Diese SVG-Datei ist zu groß für eine Bühnenzeichnung.',
  'not-svg': 'Diese Datei enthält keine lesbare SVG-Zeichnung.',
};

export const STAGE_ARTWORK_TOO_LARGE_MESSAGE = REJECTION_MESSAGES['too-large'];
export const UNREADABLE_ARTWORK_MESSAGE = 'Die Datei konnte nicht gelesen werden.';

export interface PickedArtworkFile {
  name: string;
  type: string;
  size: number;
}

const isSvgFile = (file: PickedArtworkFile): boolean =>
  file.type === SVG_MIME_TYPE || file.name.toLowerCase().endsWith(SVG_EXTENSION);

export const stageArtworkFileRejectionOf = (
  file: PickedArtworkFile,
): StageArtworkFileRejection | null => {
  if (!isSvgFile(file)) {
    return 'wrong-type';
  }
  if (file.size > STAGE_ARTWORK_MAX_LENGTH) {
    return 'too-large';
  }

  return null;
};

export const stageArtworkTextRejectionOf = (text: string): StageArtworkFileRejection | null =>
  svgRootTagOf(text.trim()) === null ? 'not-svg' : null;

const toMessage = (rejection: StageArtworkFileRejection | null): string | null =>
  rejection === null ? null : REJECTION_MESSAGES[rejection];

export const toStageArtworkFileRejection = (file: PickedArtworkFile): string | null =>
  toMessage(stageArtworkFileRejectionOf(file));

export const toStageArtworkTextRejection = (text: string): string | null =>
  toMessage(stageArtworkTextRejectionOf(text));
