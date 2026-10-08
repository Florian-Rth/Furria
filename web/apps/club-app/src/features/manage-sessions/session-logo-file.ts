export const SESSION_LOGO_MAX_LENGTH = 200_000;

const SVG_MIME_TYPE = 'image/svg+xml';

export type LogoFileRejection = 'wrong-type' | 'too-large';

const REJECTION_MESSAGES: Record<LogoFileRejection, string> = {
  'wrong-type': 'Das Sessionslogo muss eine SVG-Datei sein.',
  'too-large': 'Diese SVG-Datei ist zu groß für einen Sessionseintrag.',
};

export const UNREADABLE_FILE_MESSAGE = 'Die Datei konnte nicht gelesen werden.';

export interface PickedLogoFile {
  type: string;
  size: number;
}

export const logoFileRejectionOf = (file: PickedLogoFile): LogoFileRejection | null => {
  if (file.type !== SVG_MIME_TYPE) {
    return 'wrong-type';
  }
  if (file.size > SESSION_LOGO_MAX_LENGTH) {
    return 'too-large';
  }

  return null;
};

export const toLogoFileRejection = (file: PickedLogoFile): string | null => {
  const rejection = logoFileRejectionOf(file);

  return rejection === null ? null : REJECTION_MESSAGES[rejection];
};
