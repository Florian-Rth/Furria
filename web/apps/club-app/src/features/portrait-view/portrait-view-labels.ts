import type { KkViewerLabels } from '@furria/ui/viewer-types';

export const PORTRAIT_VIEWER_LABELS: KkViewerLabels = {
  dialog: 'Porträt',
  close: 'Schließen',
  previous: 'Voriges Bild',
  next: 'Nächstes Bild',
  counterJoin: 'von',
  play: 'Video abspielen',
  developing: 'Wird vorbereitet',
  failed: 'Das Porträt konnte nicht geladen werden',
};

export const toPortraitOpenLabel = (name: string): string => `Porträt von ${name} groß zeigen`;
