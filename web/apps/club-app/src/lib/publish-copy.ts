import type { KkHoldConfirm, KkPublishAnnouncements } from '@furria/ui';

export const WEBSITE_HOST = 'furria.de';

export const PUBLISH_HOLD_HINT = 'Gedrückt halten zum Veröffentlichen';
export const PUBLISHED_STAMP = 'Veröffentlicht';

export const PUBLISH_ANNOUNCEMENTS: KkPublishAnnouncements = {
  running: 'Wird veröffentlicht …',
  failed: 'Veröffentlichen fehlgeschlagen',
  published: 'Veröffentlicht:',
};

export type PublishConfirmCopy = Omit<KkHoldConfirm, 'cancelLabel' | 'closeLabel'>;

export const publishConfirmOf = (copy: PublishConfirmCopy): KkHoldConfirm => ({
  ...copy,
  cancelLabel: 'Abbrechen',
  closeLabel: 'Schließen',
});

export const websiteAddressOf = (path: string): string => `${WEBSITE_HOST}${path}`;
