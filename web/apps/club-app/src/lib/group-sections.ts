export const GROUP_SECTION_TITLES = {
  about: 'Die Gruppe',
  members: 'Mitglieder',
  managedMembers: 'Zugehörigkeiten',
  admins: 'Gruppen-Admins',
  history: 'Geschichte',
  events: 'Termine',
  photos: 'Bilder',
} as const;

export const GROUP_ADMINS_NOTE =
  'Gruppen-Admins pflegen die Gruppe. Sie müssen nicht selbst in der Gruppe tanzen.';

const SUBLINE_SEPARATOR = ' · ';

export const toGroupMembersLabel = (count: number): string => {
  if (count === 0) {
    return 'niemand dabei';
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
