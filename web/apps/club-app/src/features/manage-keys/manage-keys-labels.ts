import type { KkConfirmFact, KkDateQuickChoice } from '@furria/ui';
import { SESSION_OPENING_DAY, SESSION_OPENING_MONTH, sessionAt } from '@/lib/club';
import { isFutureDay, toIsoDay } from '@/lib/day';
import { formatIsoDay, formatPeriod } from '@/lib/membership-labels';
import type { KeyHolding, KeyVenue } from './schemas';

export const MANAGE_KEYS_TITLE = 'Schlüssel';

export const KEY_SECTION_TITLES = {
  ended: 'Zurückgenommen',
  archived: 'Archivierte Orte',
} as const;

export const MANAGE_KEYS_FOOTNOTE =
  'Schlüssel werden nicht gezählt und nicht nummeriert. Hier steht, wer aufschließen kann und wem wir noch einen abnehmen müssen — Zurückgenommenes bleibt stehen.';

export const toPersonName = (person: { firstName: string; lastName: string }): string =>
  `${person.firstName} ${person.lastName}`;

export interface KeyHoldingPartition {
  running: KeyHolding[];
  ended: KeyHolding[];
}

export const partitionKeyHoldings = (holdings: readonly KeyHolding[]): KeyHoldingPartition => {
  const running: KeyHolding[] = [];
  const ended: KeyHolding[] = [];

  for (const holding of holdings) {
    if (holding.untilOn === null) {
      running.push(holding);
    } else {
      ended.push(holding);
    }
  }

  return { running, ended };
};

export interface KeyVenuePartition {
  running: KeyVenue[];
  archived: KeyVenue[];
}

export const partitionKeyVenues = (venues: readonly KeyVenue[]): KeyVenuePartition => {
  const running: KeyVenue[] = [];
  const archived: KeyVenue[] = [];

  for (const venue of venues) {
    if (venue.archivedOn === null) {
      running.push(venue);
    } else {
      archived.push(venue);
    }
  }

  return { running, archived };
};

export const toHoldingPeriodLabel = (holding: KeyHolding): string =>
  holding.untilOn === null
    ? `seit ${formatIsoDay(holding.sinceOn)}`
    : formatPeriod(holding.sinceOn, holding.untilOn);

export interface KeyHoldingTarget {
  venue: KeyVenue;
  holding: KeyHolding;
}

export const findKeyHolding = (
  venues: readonly KeyVenue[],
  keyHoldingId: number | null,
): KeyHoldingTarget | null => {
  if (keyHoldingId === null) {
    return null;
  }

  for (const venue of venues) {
    const holding = venue.holdings.find((row) => row.keyHoldingId === keyHoldingId);

    if (holding !== undefined) {
      return { venue, holding };
    }
  }

  return null;
};

export const findKeyVenue = (
  venues: readonly KeyVenue[],
  venueId: number | null,
): KeyVenue | null => {
  if (venueId === null) {
    return null;
  }

  return venues.find((venue) => venue.venueId === venueId) ?? null;
};

const countRunning = (venues: readonly KeyVenue[]): number =>
  venues.reduce((total, venue) => total + partitionKeyHoldings(venue.holdings).running.length, 0);

const countVenuesWithRunning = (venues: readonly KeyVenue[]): number =>
  venues.filter((venue) => partitionKeyHoldings(venue.holdings).running.length > 0).length;

const toVenueClause = (count: number): string => (count === 1 ? 'einen Ort' : `${count} Orte`);

export const toManagedKeysIntro = (venues: readonly KeyVenue[]): string => {
  if (venues.length === 0) {
    return 'Noch steht kein Ort im Verzeichnis, für den ein Schlüssel ausgegeben werden könnte.';
  }

  const running = countRunning(venues);

  if (running === 0) {
    return 'Gerade ist kein Schlüssel ausgegeben.';
  }
  if (running === 1) {
    return 'Ein Schlüssel ist ausgegeben.';
  }

  return `${running} Schlüssel sind für ${toVenueClause(countVenuesWithRunning(venues))} ausgegeben.`;
};

export const toVenueHolderMeta = (holdings: readonly KeyHolding[]): string => {
  const { running } = partitionKeyHoldings(holdings);

  if (running.length === 0) {
    return 'kein Schlüssel';
  }
  if (running.length === 1) {
    return '1 Schlüssel';
  }

  return `${running.length} Schlüssel`;
};

export const toArchivedVenueNote = (archivedOn: string): string =>
  `Der Ort ist seit dem ${formatIsoDay(archivedOn)} archiviert. Neue Schlüssel gibt es dafür nicht mehr, die Geschichte bleibt stehen.`;

export interface KeyVenueEmptyCopy {
  title: string;
  description: string;
}

const NEVER_HELD: KeyVenueEmptyCopy = {
  title: 'KEIN SCHLÜSSEL',
  description: 'Für diesen Ort ist noch nie ein Schlüssel ausgegeben worden.',
};

const ALL_RETURNED: KeyVenueEmptyCopy = {
  title: 'ALLE ZURÜCK',
  description:
    'Gerade hat niemand einen Schlüssel für diesen Ort. Wer je einen hatte, steht unten.',
};

export const toVenueEmptyCopy = (holdings: readonly KeyHolding[]): KeyVenueEmptyCopy =>
  holdings.length === 0 ? NEVER_HELD : ALL_RETURNED;

export const NO_VENUES_TITLE = 'NOCH KEIN ORT';
export const NO_VENUES_DESCRIPTION =
  'Schlüssel hängen an Orten. Trag erst einen Ort ein, dann lässt sich einer dafür ausgeben.';

export const HANDOUT_EXPLANATION =
  'Such die Person im Verzeichnis. Wer noch nicht drin ist, muss zuerst in der Personenverwaltung angelegt werden.';
export const HANDOUT_PICKER_NOTE = 'Kein Mitglied — geht trotzdem.';

export const toHandoutConsequence = (
  personName: string,
  venueName: string,
  sinceOn: string,
  todayIsoDay: string,
): string =>
  isFutureDay(sinceOn, todayIsoDay)
    ? `Ab dem ${formatIsoDay(sinceOn)} kann ${personName} ${venueName} aufschließen — vorher nicht.`
    : `${personName} kann ${venueName} ab dem ${formatIsoDay(sinceOn)} aufschließen.`;

export const RETURN_EYEBROW = 'Schlüssel zurücknehmen';

export const toReturnQuestion = (firstName: string, venueName: string): string =>
  `Schlüssel für ${venueName} von ${firstName} zurücknehmen?`;

export const toReturnExplanation = (firstName: string): string =>
  `Der Schlüssel wandert in die Geschichte des Ortes und bleibt dort lesbar. Gelöscht wird nichts: ${firstName} kann jederzeit wieder einen bekommen.`;

export const toReturnConsequence = (
  firstName: string,
  venueName: string,
  untilOn: string,
  todayIsoDay: string,
): string =>
  isFutureDay(untilOn, todayIsoDay)
    ? `Der ${formatIsoDay(untilOn)} wird der letzte Tag, an dem ${firstName} ${venueName} aufschließen kann.`
    : `Der ${formatIsoDay(untilOn)} ist der letzte Tag, an dem ${firstName} ${venueName} aufschließen kann.`;

export const toReturnFacts = (
  holding: KeyHolding,
  venueName: string,
  untilOn: string | null,
): KkConfirmFact[] => [
  { label: 'Person', value: toPersonName(holding) },
  { label: 'Ort', value: venueName },
  { label: 'Ausgegeben am', value: formatIsoDay(holding.sinceOn) },
  { label: 'Letzter Tag', value: untilOn === null ? 'noch offen' : formatIsoDay(untilOn) },
];

const TODAY_LABEL = 'heute';
const SESSION_START_LABEL = 'Sessionsbeginn';
const SESSION_END_LABEL = 'Sessionsende';

export const toHandoutQuickChoices = (today: Date): KkDateQuickChoice[] => {
  const todayValue = toIsoDay(today);
  const session = sessionAt(today);
  const openingValue = toIsoDay(
    new Date(session.startYear, SESSION_OPENING_MONTH - 1, SESSION_OPENING_DAY),
  );

  const choices: KkDateQuickChoice[] = [{ label: TODAY_LABEL, value: todayValue }];

  if (openingValue !== todayValue) {
    choices.push({ label: SESSION_START_LABEL, value: openingValue });
  }

  return choices;
};

export const toReturnQuickChoices = (today: Date): KkDateQuickChoice[] => {
  const todayValue = toIsoDay(today);
  const session = sessionAt(today);
  const closingValue = toIsoDay(
    new Date(session.startYear + 1, SESSION_OPENING_MONTH - 1, SESSION_OPENING_DAY - 1),
  );

  const choices: KkDateQuickChoice[] = [{ label: TODAY_LABEL, value: todayValue }];

  if (closingValue !== todayValue) {
    choices.push({ label: SESSION_END_LABEL, value: closingValue });
  }

  return choices;
};

export const toKeyHandedOutMessage = (
  personName: string,
  venueName: string,
  sinceOn: string,
  todayIsoDay: string,
): string =>
  isFutureDay(sinceOn, todayIsoDay)
    ? `${personName} bekommt den Schlüssel für ${venueName} ab dem ${formatIsoDay(sinceOn)}.`
    : `${personName} hat den Schlüssel für ${venueName}.`;

export const toKeyTakenBackMessage = (
  personName: string,
  untilOn: string,
  todayIsoDay: string,
): string =>
  isFutureDay(untilOn, todayIsoDay)
    ? `Der Schlüssel von ${personName} läuft am ${formatIsoDay(untilOn)} aus.`
    : `Der Schlüssel von ${personName} ist zurück.`;

export const toHandOutLabel = (venueName: string): string => `Schlüssel für ${venueName} ausgeben`;

export const toTakeBackLabel = (personName: string): string =>
  `Schlüssel von ${personName} zurücknehmen`;
