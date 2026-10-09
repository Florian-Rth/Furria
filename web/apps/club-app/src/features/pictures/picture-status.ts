import type { PictureEditing } from '@/lib/api/schemas';

export type PictureStatus = 'none' | 'processing' | 'failed' | 'shown';

const STATUS_LINES: Record<PictureStatus, string> = {
  none: 'Noch keins – bis dahin stehen die Initialen',
  processing: 'Wird gerade vorbereitet',
  failed: 'Ließ sich nicht verarbeiten',
  shown: 'Ausschnitt ändern oder ein neues Foto wählen',
};

const GROUP_STATUS_LINES: Record<PictureStatus, string> = {
  ...STATUS_LINES,
  none: 'Noch keins – bis dahin trägt die Gruppe ihre Farbe',
};

export const toPictureStatus = (editing: PictureEditing | null): PictureStatus => {
  if (editing === null) {
    return 'none';
  }
  if (editing.state === 'failed') {
    return 'failed';
  }

  return editing.picture === null ? 'processing' : 'shown';
};

export const toPortraitStatusLine = (editing: PictureEditing | null): string =>
  STATUS_LINES[toPictureStatus(editing)];

export const toGroupPictureStatusLine = (editing: PictureEditing | null): string =>
  GROUP_STATUS_LINES[toPictureStatus(editing)];
