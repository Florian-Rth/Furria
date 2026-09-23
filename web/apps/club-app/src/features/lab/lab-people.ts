export interface LabPerson {
  initials: string;
  name: string;
  meta: string;
}

const FIRST_NAMES = ['Annika', 'Bernd', 'Carla', 'Dieter', 'Elke', 'Frank', 'Gisela', 'Heinz'];
const LAST_NAMES = ['Adam', 'Becker', 'Conrad', 'Dahmen', 'Engels', 'Fuchs', 'Görres', 'Hansen'];
const GROUPS = ['Große Garde', 'Elferrat', 'Männerballett', 'Kindergarde', 'Musikzug'];

export const LAB_PEOPLE: readonly LabPerson[] = LAST_NAMES.flatMap((last, row) =>
  FIRST_NAMES.map((first, column) => ({
    initials: `${first[0]}${last[0]}`,
    name: `${first} ${last}`,
    meta: GROUPS[(row + column) % GROUPS.length] ?? '',
  })),
);
