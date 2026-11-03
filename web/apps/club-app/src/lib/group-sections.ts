export const GROUP_SECTION_TITLES = {
  members: 'Wer dabei ist',
  usualTrainingTimes: 'Übliche Trainingszeiten',
  history: 'Geschichte',
  events: 'Termine',
  settings: 'Einstellungen',
} as const;

export const GROUP_ADMINS_NOTE =
  'Gruppen-Admins verwalten die Gruppe und müssen ihr nicht selbst angehören.';

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
