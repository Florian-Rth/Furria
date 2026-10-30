import type { SetupKey, SetupRow, SetupState } from './studio-setup';

export const SETUP_TITLE = 'Einrichten';
export const SETUP_LIST_LABEL = 'Auftritt einrichten';
export const SETUP_TO_EDITOR = 'Zum Bearbeiten';
export const SETUP_UPLOADING = 'Lädt hoch';

export const SETUP_TITLES: Record<SetupKey, string> = {
  music: 'Musik',
  steps: 'Schritte',
  spots: 'Plätze',
  formation: 'Aufstellung',
  video: 'Video',
  final: 'Endfassung',
};

export const SETUP_ACTIONS: Record<SetupKey, string> = {
  music: 'Lied hochladen',
  steps: 'Ersten Schritt setzen',
  spots: 'Platz hinzufügen',
  formation: 'Aufstellen',
  video: 'Video hochladen',
  final: 'Endfassung',
};

export const SETUP_STEPS_DONE_ACTION = 'Zu den Schritten';

export const SETUP_HINTS: Record<SetupKey, string> = {
  music: 'Lieder auswählen und hochladen',
  steps: 'Am Anfang der Musik',
  spots: 'Einen Platz auf die Bühne stellen',
  formation: 'Plätze für den ersten Schritt ziehen',
  video: 'Trainervideo hochladen',
  final: 'Die fertig geschnittene Musik',
};

export const SETUP_STATES: Record<SetupState, string> = {
  done: 'erledigt',
  next: 'als Nächstes',
  open: 'offen',
};

const amountOf = (count: number, one: string, many: string): string =>
  `${count} ${count === 1 ? one : many}`;

const LOCKED_FACTS: Partial<Record<SetupKey, string>> = {
  steps: 'Geht, sobald Musik da ist.',
  formation: 'Geht, sobald es Plätze und einen Schritt gibt.',
  video: 'Geht, sobald Musik da ist.',
};

const waitingOf = (count: number): string => (count === 1 ? 'wartet' : 'warten');

const finalFactOf = (amount: number, waiting: number): string => {
  const versions = amountOf(amount, 'Fassung', 'Fassungen');

  return waiting === 0 ? versions : `${versions}, ${waiting} ${waitingOf(waiting)}`;
};

export const setupFactOf = (row: SetupRow): string => {
  const locked = row.ready || row.state === 'done' ? undefined : LOCKED_FACTS[row.key];
  if (locked !== undefined) {
    return locked;
  }

  switch (row.key) {
    case 'music':
      return row.amount === 0
        ? 'Noch kein Lied – Lieder werden zu einer Mischung geschnitten.'
        : `${amountOf(row.amount, 'Lied', 'Lieder')} in der Mischung`;
    case 'steps':
      return row.amount === 0
        ? 'Musik abspielen und an jeder Stelle einen Schritt setzen.'
        : `${amountOf(row.amount, 'Schritt', 'Schritte')} gesetzt`;
    case 'spots':
      return row.amount === 0
        ? 'Für jede Tänzerin einen Platz auf der Bühne.'
        : `${amountOf(row.amount, 'Platz', 'Plätze')}, davon ${row.open} offen`;
    case 'formation':
      return row.amount === 0
        ? 'Plätze für den ersten Schritt auf die Bühne ziehen.'
        : `${amountOf(row.amount, 'Platz', 'Plätze')} aufgestellt, ${row.open} noch ohne Stelle`;
    case 'video':
      return row.amount === 0
        ? 'Ein Probevideo zum Mitlernen hochladen.'
        : amountOf(row.amount, 'Video', 'Videos');
    case 'final':
      return row.amount === 0
        ? 'Die fertig geschnittene Musik, wenn sie da ist.'
        : finalFactOf(row.amount, row.open);
  }
};

export const uploadFactOf = (name: string, share: number): string =>
  `${SETUP_UPLOADING}: ${name} · ${Math.round(share * 100)} %`;

export const setupLaneLabelOf = (number: number, total: number, action: string): string =>
  `${action} – Einrichten, Schritt ${number} von ${total}`;

export const setupProgressTextOf = (done: number, total: number): string => `${done}/${total}`;

export const setupProgressLabelOf = (done: number, total: number): string =>
  `Einrichten: ${done} von ${total} erledigt`;
