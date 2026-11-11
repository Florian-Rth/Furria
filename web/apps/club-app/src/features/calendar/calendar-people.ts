import type { AudiencePerson, ChoosablePerson } from './schemas';

export const MATCH_LIMIT = 8;
const DIACRITICS = /\p{Diacritic}/gu;
const WHITESPACE = /\s+/;

export interface CalendarPersonName {
  personId: number;
  firstName: string;
  lastName: string;
}

export interface CalendarGroupShortcut {
  groupId: number;
  name: string;
  missingIds: string[];
}

export const folded = (value: string): string =>
  value.normalize('NFD').replace(DIACRITICS, '').toLocaleLowerCase('de');

export const toPersonName = (person: Pick<CalendarPersonName, 'firstName' | 'lastName'>): string =>
  `${person.firstName} ${person.lastName}`;

const fullNameOf = (person: CalendarPersonName): string => folded(toPersonName(person));

export const toChosenPeople = (
  chosenIds: readonly string[],
  people: readonly ChoosablePerson[],
  held: readonly AudiencePerson[],
): CalendarPersonName[] => {
  const known = new Map<number, CalendarPersonName>();

  for (const person of [...held, ...people]) {
    known.set(person.personId, {
      personId: person.personId,
      firstName: person.firstName,
      lastName: person.lastName,
    });
  }

  return chosenIds.flatMap((id) => {
    const person = known.get(Number(id));

    return person === undefined ? [] : [person];
  });
};

export const toPersonMatches = (
  people: readonly ChoosablePerson[],
  query: string,
  chosenIds: readonly string[],
): ChoosablePerson[] => {
  const tokens = folded(query)
    .trim()
    .split(WHITESPACE)
    .filter((token) => token !== '');

  if (tokens.length === 0) {
    return [];
  }

  const chosen = new Set(chosenIds);

  return people
    .filter((person) => !chosen.has(String(person.personId)))
    .filter((person) => {
      const name = fullNameOf(person);

      return tokens.every((token) => name.includes(token));
    })
    .slice(0, MATCH_LIMIT);
};

export const toGroupShortcuts = (
  groups: readonly { groupId: number; name: string }[],
  people: readonly ChoosablePerson[],
  chosenIds: readonly string[],
): CalendarGroupShortcut[] => {
  const chosen = new Set(chosenIds);

  return groups
    .map((group) => ({
      groupId: group.groupId,
      name: group.name,
      missingIds: people
        .filter((person) => person.groupIds.includes(group.groupId))
        .map((person) => String(person.personId))
        .filter((id) => !chosen.has(id)),
    }))
    .filter((shortcut) => shortcut.missingIds.length > 0);
};

export const toChosenWithGroup = (
  chosenIds: readonly string[],
  shortcut: Pick<CalendarGroupShortcut, 'missingIds'>,
): string[] => [...new Set([...chosenIds, ...shortcut.missingIds])];

export const toChosenWithPerson = (chosenIds: readonly string[], personId: number): string[] => [
  ...new Set([...chosenIds, String(personId)]),
];

export const toChosenWithoutPerson = (chosenIds: readonly string[], personId: number): string[] =>
  chosenIds.filter((id) => id !== String(personId));
