import { SESSION_LOGO_MAX_LENGTH } from './schemas';

const SVG_MIME_TYPE = 'image/svg+xml';

const WRONG_TYPE_MESSAGE = 'Das Sessionslogo muss eine SVG-Datei sein.';
const TOO_LARGE_MESSAGE = 'Diese SVG-Datei ist zu groß für einen Sessionseintrag.';

export const UNREADABLE_FILE_MESSAGE = 'Diese Datei ließ sich nicht lesen.';

export interface PickedLogoFile {
  type: string;
  size: number;
}

export const toLogoFileRejection = (file: PickedLogoFile): string | null => {
  if (file.type !== SVG_MIME_TYPE) {
    return WRONG_TYPE_MESSAGE;
  }
  if (file.size > SESSION_LOGO_MAX_LENGTH) {
    return TOO_LARGE_MESSAGE;
  }

  return null;
};
