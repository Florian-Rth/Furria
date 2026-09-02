import type { LinkProps } from '@tanstack/react-router';

export const scheduleHeading = 'ALLE TERMINE';

export interface EndOfSeasonContent {
  kicker: string;
  headline: string;
  body: string;
  galleryLabel: string;
  galleryTo: LinkProps['to'];
  newsLabel: string;
  newsTo: LinkProps['to'];
}

export const endOfSeasonContent: EndOfSeasonContent = {
  kicker: 'BIS ZUR NÄCHSTEN SESSION',
  headline: 'DIE SESSION IST GEFEIERT',
  body: 'Alle Abende dieser Session sind vorbei. Die schönsten Momente leben in der Galerie weiter — und die nächste Session kündigt sich zuerst bei den Meldungen an.',
  galleryLabel: 'Zur Galerie →',
  galleryTo: '/gallery',
  newsLabel: 'Zu den Meldungen →',
  newsTo: '/news',
};
