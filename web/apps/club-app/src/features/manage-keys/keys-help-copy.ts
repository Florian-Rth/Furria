export const KEYS_HELP_SPOTS = {
  venue: 'help-keys-venue',
} as const;

export const KEY_EDITOR_HELP_SPOTS = {
  person: 'help-key-person',
  handout: 'help-key-handout',
  return: 'help-key-return',
} as const;

export const KEYS_HELP_COPY = {
  venue: {
    title: 'Wer welchen Schlüssel hat',
    text: 'Jeder Ort hat einen eigenen Bereich. Darin steht, wer gerade einen Schlüssel dafür hat und seit wann.',
    handout: 'Mit „+ Schlüssel“ gibst du einen Schlüssel für diesen Ort aus.',
  },
  takeBack: {
    title: 'Schlüssel zurückholen',
    text: '„nicht im Verein aktiv“ heißt: Die Person hat noch einen Schlüssel, ist aber nicht mehr im Verein aktiv. Solange das so ist, steht „Schlüssel zurückholen“ unter „Zu erledigen“.',
    tap: 'Tippe eine Person an, um die Rückgabe einzutragen.',
  },
  history: {
    title: 'Zurückgenommen',
    text: 'Unter jedem Ort stehen die zurückgegebenen Schlüssel mit Zeitraum. So bleibt nachvollziehbar, wer wann einen hatte.',
  },
  archived: {
    title: 'Archivierte Orte',
    text: 'Ganz unten stehen archivierte Orte. Dort gibst du keine Schlüssel mehr aus, kannst aber noch laufende zurücknehmen.',
  },
} as const;

export const KEY_EDITOR_HELP_COPY = {
  person: {
    title: 'Person',
    text: 'Suche unter „Person suchen“ nach Vor- oder Nachname und wähle die Person aus.',
  },
  chain: {
    title: 'Bisherige Schlüsselübergaben',
    text: 'Die Liste zeigt, wer für diesen Ort schon einen Schlüssel hatte oder hat.',
  },
  handout: {
    title: 'Übergabe',
    text: 'Unter „Ausgegeben am“ trägst du den Tag der Übergabe ein. „heute“ und „Sessionsbeginn“ setzen ihn mit einem Tipp. Ein Tag in der Zukunft ist erlaubt.',
    save: 'Über dem Knopf „Schlüssel ausgeben“ steht, ab wann die Person aufschließen kann.',
  },
  return: {
    title: 'Rückgabe',
    text: 'Unter „Letzter Tag“ trägst du ein, bis wann die Person den Schlüssel hat – dieser Tag zählt noch mit. „heute“ und „Sessionsende“ setzen ihn mit einem Tipp.',
    save: '„Schlüssel zurücknehmen“ beendet die Übergabe. Sie bleibt unter „Zurückgenommen“ sichtbar.',
  },
} as const;
