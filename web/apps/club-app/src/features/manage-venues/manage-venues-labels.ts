import type { KkConfirmFact } from '@furria/ui';
import { formatIsoDay } from '@/lib/membership-labels';
import type { ManagedVenue } from './schemas';

export const MANAGE_VENUES_TITLE = 'Orte';
export const MANAGE_VENUES_CREATE_LABEL = 'Ort eintragen';

export const VENUE_SECTION_TITLES = {
  running: 'Im Verzeichnis',
  archived: 'Archiviert',
} as const;

export interface ManagedVenuesEmptyCopy {
  title: string;
  description: string;
}

export const MANAGED_VENUES_EMPTY: ManagedVenuesEmptyCopy = {
  title: 'NOCH KEIN ORT',
  description:
    'Trag den ersten Ort ein. Danach lassen sich Schlüssel dafür ausgeben und Termine dort ansetzen.',
};

export const MANAGE_VENUES_FOOTNOTE =
  'Archivieren löscht nichts: Der Ort verschwindet aus den Schlüsselkacheln und aus der Ortsauswahl im Kalender, seine Termine und Schlüssel bleiben stehen.';

export const toVenueAddressLine = (venue: ManagedVenue): string =>
  `${venue.street}, ${venue.zip} ${venue.city}`;

export interface ManagedVenuePartition {
  running: ManagedVenue[];
  archived: ManagedVenue[];
}

export const partitionVenues = (venues: readonly ManagedVenue[]): ManagedVenuePartition => {
  const running: ManagedVenue[] = [];
  const archived: ManagedVenue[] = [];

  for (const venue of venues) {
    if (venue.archivedOn === null) {
      running.push(venue);
    } else {
      archived.push(venue);
    }
  }

  return { running, archived };
};

export const findManagedVenue = (
  venues: readonly ManagedVenue[],
  venueId: number | null,
): ManagedVenue | null => {
  if (venueId === null) {
    return null;
  }

  return venues.find((venue) => venue.venueId === venueId) ?? null;
};

const toRunningClause = (count: number): string => {
  if (count === 0) {
    return 'Kein Ort steht im Verzeichnis.';
  }
  if (count === 1) {
    return 'Ein Ort steht im Verzeichnis.';
  }

  return `${count} Orte stehen im Verzeichnis.`;
};

const toArchivedClause = (count: number): string =>
  count === 1 ? 'Einer ist archiviert.' : `${count} weitere sind archiviert.`;

export const toManagedVenuesIntro = (venues: readonly ManagedVenue[]): string => {
  if (venues.length === 0) {
    return 'Noch steht kein Ort im Verzeichnis.';
  }

  const { running, archived } = partitionVenues(venues);
  const head = toRunningClause(running.length);

  if (archived.length === 0) {
    return head;
  }

  return `${head} ${toArchivedClause(archived.length)}`;
};

export const toArchivedSinceLine = (archivedOn: string): string =>
  `Archiviert am ${formatIsoDay(archivedOn)}. Zum Bearbeiten musst du den Ort zuerst wieder aktivieren.`;

export const toArchiveQuestion = (name: string): string => `${name} archivieren?`;

export const ARCHIVE_EYEBROW = 'Ort archivieren';
export const ARCHIVE_EXPLANATION =
  'Archivieren löscht nichts: Die Schlüssel und die Termine bleiben bestehen — der Ort steht nur nicht mehr zur Auswahl. Er verschwindet aus den Schlüsselkacheln und aus der Ortsauswahl im Kalender, seine Geschichte bleibt stehen.';

export const toArchiveConsequence = (name: string, todayLabel: string): string =>
  `Ab dem ${todayLabel} steht ${name} nicht mehr zur Auswahl. Die Schlüssel und die Termine bleiben bestehen.`;

export const toRestoreQuestion = (name: string): string => `${name} wieder aktivieren?`;

export const RESTORE_EYEBROW = 'Ort aktivieren';
export const RESTORE_EXPLANATION =
  'Der Ort steht wieder in den Schlüsselkacheln und in der Ortsauswahl des Kalenders. An seiner Geschichte ändert sich nichts — sie war nie weg.';

export const toRestoreConsequence = (name: string, todayLabel: string): string =>
  `Ab dem ${todayLabel} steht ${name} wieder zur Auswahl. An den Schlüsseln und den Terminen ändert sich nichts.`;

export const toVenueFacts = (venue: ManagedVenue, dayLabel: string): KkConfirmFact[] => [
  { label: 'Ort', value: venue.name },
  { label: 'Anschrift', value: toVenueAddressLine(venue) },
  { label: 'Ab', value: dayLabel },
];

export const toVenueCreatedMessage = (name: string): string => `${name} ist eingetragen.`;

export const toVenueSavedMessage = (name: string): string => `${name} ist gespeichert.`;

export const toVenueArchivedMessage = (name: string): string => `${name} ist archiviert.`;

export const toVenueRestoredMessage = (name: string): string => `${name} steht wieder zur Auswahl.`;
