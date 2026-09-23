import type { KkDateQuickChoice, KkScreenOrigin } from '@furria/ui';
import { SESSION_OPENING_DAY, SESSION_OPENING_MONTH, sessionAt } from '@/lib/club';
import { isFutureDay, toIsoDay } from '@/lib/day';
import { formatIsoDay, formatPeriod } from '@/lib/membership-labels';
import type { KeyHolding, KeyVenue } from './schemas';

export const MANAGE_KEYS_TITLE = 'Schlüssel';
const KEYS_PATH = '/manage/keys';

export const KEYS_ORIGIN: KkScreenOrigin = { label: MANAGE_KEYS_TITLE, to: KEYS_PATH };

export const KEY_EDITOR_DENIED_MESSAGE =
  'Dir fehlt die Berechtigung, Schlüssel auszugeben oder zurückzunehmen.';

export const toKeyEditorOrigin = (venueName: string): KkScreenOrigin => ({
  label: venueName,
  to: KEYS_PATH,
});

const KEY_ID_PATTERN = /^[1-9]\d*$/;

export const toVenueIdParam = (raw: string): number | null =>
  KEY_ID_PATTERN.test(raw) ? Number(raw) : null;

export const toKeyHoldingIdParam = (raw: string): number | null =>
  KEY_ID_PATTERN.test(raw) ? Number(raw) : null;

export const KEY_SECTION_TITLES = {
  ended: 'Zurückgenommen',
  archived: 'Archivierte Orte',
} as const;

export const MANAGE_KEYS_FOOTNOTE =
  'Übersicht, wer welchen Ort aufschließen kann. Zurückgegebene Schlüssel bleiben im Verlauf erhalten.';

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

export interface KeyHoldingChainRow {
  key: string;
  title: string;
  span: string;
  isEdited: boolean;
}

export const toKeyHoldingChainRows = (
  venue: KeyVenue,
  editedKeyHoldingId: number | null,
): KeyHoldingChainRow[] =>
  venue.holdings.map((holding) => ({
    key: String(holding.keyHoldingId),
    title: toPersonName(holding),
    span: toHoldingPeriodLabel(holding),
    isEdited: holding.keyHoldingId === editedKeyHoldingId,
  }));

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

export const MANAGE_KEYS_LEAD = 'Wer welchen Ort aufschließen kann.';
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
  `Der Ort ist seit dem ${formatIsoDay(archivedOn)} archiviert. Es können keine Schlüssel mehr ausgegeben werden.`;

export interface KeyVenueEmptyCopy {
  title: string;
  description: string;
}

const NEVER_HELD: KeyVenueEmptyCopy = {
  title: 'KEIN SCHLÜSSEL',
  description: 'Für diesen Ort wurde noch kein Schlüssel ausgegeben.',
};

const ALL_RETURNED: KeyVenueEmptyCopy = {
  title: 'ALLE ZURÜCK',
  description: 'Derzeit hat niemand einen Schlüssel für diesen Ort.',
};

export const toVenueEmptyCopy = (holdings: readonly KeyHolding[]): KeyVenueEmptyCopy =>
  holdings.length === 0 ? NEVER_HELD : ALL_RETURNED;

export const NO_VENUES_TITLE = 'NOCH KEIN ORT';
export const NO_VENUES_DESCRIPTION = 'Lege zuerst einen Ort an, um Schlüssel auszugeben.';

export const HANDOUT_EXPLANATION = 'Neue Personen werden in der Personenverwaltung angelegt.';
export const HANDOUT_PICKER_NOTE = 'Auch ohne Mitgliedschaft möglich.';

export const toHandoutConsequence = (
  personName: string,
  venueName: string,
  sinceOn: string,
  todayIsoDay: string,
): string =>
  isFutureDay(sinceOn, todayIsoDay)
    ? `${personName} kann ${venueName} ab dem ${formatIsoDay(sinceOn)} aufschließen.`
    : `${personName} kann ${venueName} seit dem ${formatIsoDay(sinceOn)} aufschließen.`;

export const toReturnConsequence = (
  firstName: string,
  venueName: string,
  untilOn: string,
  todayIsoDay: string,
): string =>
  isFutureDay(untilOn, todayIsoDay)
    ? `${firstName} kann ${venueName} bis einschließlich ${formatIsoDay(untilOn)} aufschließen.`
    : `Der Schlüssel von ${firstName} für ${venueName} ist zum ${formatIsoDay(untilOn)} zurückgegeben.`;

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
    : `Der Schlüssel von ${personName} ist zurückgegeben.`;

export const toHandOutLabel = (venueName: string): string => `Schlüssel für ${venueName} ausgeben`;
