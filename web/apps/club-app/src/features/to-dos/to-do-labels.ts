import type { KkIconName } from '@furria/ui';
import type { ToDoKind } from './schemas';

interface ToDoLabel {
  one: string;
  other: string;
}

export interface ToDoCount {
  kind: ToDoKind;
  count: number;
}

const SINGLE = 1;

const TO_DO_LABELS: Record<ToDoKind, ToDoLabel> = {
  neverInvited: { one: 'nie eingeladen', other: 'nie eingeladen' },
  reminderDue: { one: 'Erinnerung fällig', other: 'Erinnerungen fällig' },
  inPersonOnly: { one: 'nur vor Ort einladbar', other: 'nur vor Ort einladbar' },
  birthDateUnknown: { one: 'Geburtsdatum fehlt', other: 'Geburtsdaten fehlen' },
  keyToTakeBack: { one: 'Schlüssel zurückholen', other: 'Schlüssel zurückholen' },
  clubRecordGap: { one: 'Lücke in Vereinsdaten', other: 'Lücken in Vereinsdaten' },
  applicationWaiting: { one: 'Beitrittsantrag offen', other: 'Beitrittsanträge offen' },
  ticketRequestWaiting: { one: 'Kartenanfrage offen', other: 'Kartenanfragen offen' },
};

export const TO_DO_ICONS: Record<ToDoKind, KkIconName> = {
  neverInvited: 'send',
  reminderDue: 'reminder',
  inPersonOnly: 'handshake',
  birthDateUnknown: 'birthday',
  keyToTakeBack: 'key',
  clubRecordGap: 'club',
  applicationWaiting: 'mail',
  ticketRequestWaiting: 'events',
};

export const toToDoLabel = ({ kind, count }: ToDoCount): string => {
  const label = TO_DO_LABELS[kind];

  return count === SINGLE ? label.one : label.other;
};
