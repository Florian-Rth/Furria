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
} as const;

export const GROUP_ADMINS_NOTE =
  'Gruppen-Admins pflegen die Gruppe. Sie müssen nicht selbst in der Gruppe tanzen.';

export const NO_ADMINS_LINE =
  'Für diese Gruppe ist gerade niemand als Gruppen-Admin eingetragen. Ohne Admin pflegt die Gruppenverwaltung sie allein.';

export const GROUP_PEOPLE_NOTE =
  'Gruppen-Admins stehen vorn. Sie pflegen die Gruppe und müssen nicht selbst dabei sein.';

export const toGroupPeopleNote = (people: number, admins: number): string | undefined => {
  if (people === 0) {
    return undefined;
  }

  return admins === 0 ? NO_ADMINS_LINE : GROUP_PEOPLE_NOTE;
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
