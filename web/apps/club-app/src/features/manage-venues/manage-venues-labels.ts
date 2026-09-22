import type { KkConfirmFact, KkScreenOrigin } from '@furria/ui';
import { formatIsoDay } from '@/lib/membership-labels';
import type { ManagedVenue } from './schemas';

export const MANAGE_VENUES_TITLE = 'Orte';
export const MANAGE_VENUES_CREATE_LABEL = 'Ort hinzufügen';

export const VENUES_ORIGIN: KkScreenOrigin = { label: MANAGE_VENUES_TITLE, to: '/manage/venues' };

export const VENUE_SECTION_TITLES = {
  running: 'Im Verzeichnis',
  archived: 'Archiviert',
} as const;

const VENUE_ID_PATTERN = /^[1-9]\d*$/;

export const toVenueId = (raw: string): number | null =>
  VENUE_ID_PATTERN.test(raw) ? Number(raw) : null;

export const VENUE_NOT_FOUND_TITLE = 'NICHT MEHR DA';
export const VENUE_NOT_FOUND_DESCRIPTION = 'Diesen Ort gibt es nicht mehr.';

export const VENUE_EDITOR_DENIED_MESSAGE =
  'Sessionseinträge und Orte sind an eine Rolle gebunden. Du hast sie gerade nicht.';

export const VENUE_EDIT_LABEL = 'Bearbeiten';
export const ARCHIVE_VENUE_LABEL = 'Ort archivieren';

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

export const VENUE_WITHOUT_ADDRESS =
  'Noch ohne Anschrift — trag sie nach, sonst findet niemand hin.';

const isWritten = (part: string): boolean => part.length > 0;

export const toVenueAddressLine = (venue: ManagedVenue): string | null => {
  const town = [venue.zip.trim(), venue.city.trim()].filter(isWritten).join(' ');
  const parts = [venue.street.trim(), town].filter(isWritten);

  if (parts.length === 0) {
    return null;
  }

  return parts.join(', ');
};

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

export const toVenueFacts = (venue: ManagedVenue, dayLabel: string): KkConfirmFact[] => {
  const addressLine = toVenueAddressLine(venue);
  const facts: KkConfirmFact[] = [{ label: 'Ort', value: venue.name }];

  if (addressLine !== null) {
    facts.push({ label: 'Anschrift', value: addressLine });
  }

  facts.push({ label: 'Ab', value: dayLabel });

  return facts;
};

export const toVenueCreatedMessage = (name: string): string => `${name} ist eingetragen.`;

export const toVenueSavedMessage = (name: string): string => `${name} ist gespeichert.`;

export const toVenueArchivedMessage = (name: string): string => `${name} ist archiviert.`;

export const toVenueRestoredMessage = (name: string): string => `${name} steht wieder zur Auswahl.`;
