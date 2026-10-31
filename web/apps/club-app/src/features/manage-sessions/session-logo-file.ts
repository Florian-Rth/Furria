export const SESSION_LOGO_MAX_BYTES = 100 * 1024 * 1024;

const LOGO_TYPES: ReadonlySet<string> = new Set([
  'image/png',
  'image/webp',
  'image/jpeg',
  'image/heic',
  'image/heif',
]);
const LOGO_EXTENSION = /\.(png|webp|jpe?g|heic|heif)$/i;

export type LogoFileRejection = 'wrong-type' | 'too-large';

const REJECTION_MESSAGES: Record<LogoFileRejection, string> = {
  'wrong-type':
    'Das Sessionslogo muss ein Bild sein – am besten PNG oder WebP mit durchsichtigem Hintergrund.',
  'too-large': 'Dieses Bild ist zu groß. Erlaubt sind bis zu 100 MB.',
};

export interface PickedLogoFile {
  name: string;
  type: string;
  size: number;
}

const isPicture = ({ name, type }: PickedLogoFile): boolean =>
  type === '' ? LOGO_EXTENSION.test(name) : LOGO_TYPES.has(type);

export const logoFileRejectionOf = (file: PickedLogoFile): LogoFileRejection | null => {
  if (!isPicture(file)) {
    return 'wrong-type';
  }
  if (file.size > SESSION_LOGO_MAX_BYTES) {
    return 'too-large';
  }

  return null;
};

export const toLogoFileRejection = (file: PickedLogoFile): string | null => {
  const rejection = logoFileRejectionOf(file);

  return rejection === null ? null : REJECTION_MESSAGES[rejection];
};
