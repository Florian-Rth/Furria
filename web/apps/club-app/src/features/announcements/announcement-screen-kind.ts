import type { KkScreenProps } from '@furria/ui/screen-declaration';
import { ANNOUNCEMENTS_ORIGIN } from './announcements-labels';

export type AnnouncementScreenKind = 'fullscreen' | 'detail';

export const toAnnouncementScreenFrame = (
  kind: AnnouncementScreenKind,
  title: string,
): KkScreenProps =>
  kind === 'detail'
    ? { kind: 'detail', title, origin: ANNOUNCEMENTS_ORIGIN }
    : { kind: 'fullscreen', title, origin: ANNOUNCEMENTS_ORIGIN };
