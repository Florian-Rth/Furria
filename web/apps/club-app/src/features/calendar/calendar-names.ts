import type { KkAnswerRollTone } from '@furria/ui/KkAnswerRoll';
import { folded } from './calendar-people';

export const INLINE_NAME_BUDGET = 3;
export const OPEN_TAB_ID = 'open';
export const NAME_SEARCH_FROM = 15;
export const OWN_NAME_LABEL = 'Du';

const NAME_SEPARATOR = ', ';
const WHITESPACE = /\s+/;

export interface NameEntry {
  key: string;
  name: string;
  isOwn: boolean;
  note?: string;
  text?: string;
  removeLabel?: string;
  remove?: () => void;
}

export interface NamesTab {
  id: string;
  label: string;
  count: number;
  tone?: KkAnswerRollTone;
  entries: readonly NameEntry[] | null;
}

export interface SheetTab extends NamesTab {
  entries: readonly NameEntry[];
}

export interface NameLine {
  names: string;
  more: string | undefined;
}

export interface CappedList<T> {
  shown: T[];
  hidden: number;
}

const byName = (left: NameEntry, right: NameEntry): number =>
  left.name.localeCompare(right.name, 'de');

export const toSheetOrder = (entries: readonly NameEntry[]): NameEntry[] => [
  ...entries.filter((entry) => entry.isOwn),
  ...entries.filter((entry) => !entry.isOwn).sort(byName),
];

export const toMoreLabel = (hidden: number): string | undefined =>
  hidden > 0 ? `+${hidden}` : undefined;

export const toNameLine = (
  entries: readonly NameEntry[],
  budget: number = INLINE_NAME_BUDGET,
): NameLine | null => {
  if (entries.length === 0) {
    return null;
  }

  const shown = toSheetOrder(entries).slice(0, budget);

  return {
    names: shown.map((entry) => (entry.isOwn ? OWN_NAME_LABEL : entry.name)).join(NAME_SEPARATOR),
    more: toMoreLabel(entries.length - shown.length),
  };
};

const matchesAll = (entry: NameEntry, words: readonly string[]): boolean => {
  const haystack = folded(`${entry.name} ${entry.note ?? ''} ${entry.text ?? ''}`);

  return words.every((word) => haystack.includes(word));
};

export const toNameMatches = (entries: readonly NameEntry[], query: string): NameEntry[] => {
  const words = folded(query).trim().split(WHITESPACE).filter(Boolean);

  return words.length === 0 ? [...entries] : entries.filter((entry) => matchesAll(entry, words));
};

export const isNameSearchable = (count: number): boolean => count >= NAME_SEARCH_FROM;

export const toOwnFirst = <T extends { isOwn: boolean }>(items: readonly T[]): T[] => [
  ...items.filter((item) => item.isOwn),
  ...items.filter((item) => !item.isOwn),
];

export const toCappedList = <T>(
  items: readonly T[],
  limit: number,
  expanded = false,
): CappedList<T> => {
  if (expanded || items.length <= limit) {
    return { shown: [...items], hidden: 0 };
  }

  return { shown: items.slice(0, limit), hidden: items.length - limit };
};

const hasEntries = (tab: NamesTab): tab is SheetTab =>
  tab.entries !== null && tab.entries.length > 0;

export const toSheetTabs = (tabs: readonly NamesTab[]): SheetTab[] => tabs.filter(hasEntries);

export const isTabOpenable = (tabs: readonly NamesTab[], tabId: string): boolean =>
  toSheetTabs(tabs).some((tab) => tab.id === tabId);

export const toCurrentTab = (tabs: readonly SheetTab[], tabId: string | null): SheetTab | null =>
  tabs.find((tab) => tab.id === tabId) ?? tabs[0] ?? null;

export interface NamedPerson {
  personId: number;
  firstName: string;
  lastName: string;
}

export const toPersonEntry = (
  person: NamedPerson,
  ownPersonId: number | null,
  note?: string,
): NameEntry => {
  const entry = {
    key: String(person.personId),
    name: `${person.firstName} ${person.lastName}`,
    isOwn: person.personId === ownPersonId,
  };

  return note === undefined ? entry : { ...entry, note };
};

export const toOpenTab = (
  notAnswered: readonly NamedPerson[] | null,
  ownPersonId: number | null,
  label: string,
): NamesTab | null =>
  notAnswered === null || notAnswered.length === 0
    ? null
    : {
        id: OPEN_TAB_ID,
        label,
        count: notAnswered.length,
        tone: 'open',
        entries: notAnswered.map((person) => toPersonEntry(person, ownPersonId)),
      };
