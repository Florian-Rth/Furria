export const GROUP_SECTION_TITLES = {
  about: 'Die Gruppe',
  description: 'Kurz gesagt',
  members: 'Wer dabei ist',
  managedMembers: 'Zugehörigkeiten',
  admins: 'Gruppen-Admins',
  care: 'Die Gruppe pflegen',
  rhythm: 'Trainingsrhythmus',
  history: 'Geschichte',
  events: 'Termine',
  administration: 'Für die Verwaltung',
} as const;

export const GROUP_ADMINS_NOTE =
  'Gruppen-Admins verwalten die Gruppe und müssen ihr nicht selbst angehören.';

export type GroupPeopleNoteKind = 'no-admins' | 'admins-first';

const GROUP_PEOPLE_NOTES: Record<GroupPeopleNoteKind, string> = {
  'no-admins':
    'Diese Gruppe hat keinen Gruppen-Admin. Sie wird von der Gruppenverwaltung gepflegt.',
  'admins-first': 'Gruppen-Admins stehen oben. Sie müssen der Gruppe nicht selbst angehören.',
};

export const toGroupPeopleNoteKind = (
  people: number,
  admins: number,
): GroupPeopleNoteKind | undefined => {
  if (people === 0) {
    return undefined;
  }

  return admins === 0 ? 'no-admins' : 'admins-first';
};

export const toGroupPeopleNote = (people: number, admins: number): string | undefined => {
  const kind = toGroupPeopleNoteKind(people, admins);

  return kind === undefined ? undefined : GROUP_PEOPLE_NOTES[kind];
};

const SUBLINE_SEPARATOR = ' · ';

export const toGroupMembersLabel = (count: number): string => {
  if (count === 0) {
    return 'keine Mitglieder';
  }
  if (count === 1) {
    return '1 Person';
  }

  return `${count} Personen`;
};

export const toGroupAdminsLabel = (count: number): string => {
  if (count === 0) {
    return 'kein Gruppen-Admin';
  }
  if (count === 1) {
    return '1 Gruppen-Admin';
  }

  return `${count} Gruppen-Admins`;
};

export const toGroupSubline = (members: number, admins: number): string =>
  [toGroupMembersLabel(members), toGroupAdminsLabel(admins)].join(SUBLINE_SEPARATOR);
