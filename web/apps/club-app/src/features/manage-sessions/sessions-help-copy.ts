export const SESSIONS_HELP_SPOTS = {
  current: 'help-sessions-current',
  past: 'help-sessions-past',
} as const;

export const SESSION_EDITOR_HELP_SPOTS = {
  session: 'help-session-year',
  motto: 'help-session-motto',
} as const;

export const SESSIONS_HELP_COPY = {
  record: {
    title: 'Was ein Sessionseintrag ist',
    text: 'Er hält fest, was der Verein über eine Session weiß: Sessionsnummer, Motto und Sessionslogo. Nur das Jahr ist Pflicht.',
  },
  current: {
    title: 'Aktuell',
    text: 'Hier stehen diese und kommende Sessions, die laufende mit „diese Session“.',
    vacant:
      'Fehlt ihr Eintrag, steht dort „Noch kein Sessionseintrag“. Antippen legt ihn mit dem passenden Jahr an.',
    add: 'Mit „+ Session“ trägst du eine Session für ein beliebiges Jahr ein.',
  },
  past: {
    title: 'Frühere Sessions',
    text: 'Alle älteren Einträge. Tippe eine Zeile an, um Nummer, Motto oder Logo zu ändern.',
  },
} as const;

export const SESSION_EDITOR_HELP_COPY = {
  session: {
    title: 'Session und Nummer',
    text: 'Wähle die Session. Die Sessionsnummer steht auf dem Orden – lass sie leer, wenn ihr sie nicht kennt.',
  },
  motto: {
    title: 'Motto & Logo',
    text: 'Das Motto trägst du im originalen Wortlaut ein. Es darf auch fehlen.',
    logo: 'Mit „Hochladen“ wählst du das Sessionslogo, am besten PNG oder WebP mit durchsichtigem Hintergrund. Hochgeladen wird es erst beim Speichern.',
  },
  save: {
    title: 'Speichern',
    create: '„Hinzufügen“ legt den Sessionseintrag an.',
    edit: '„Speichern“ übernimmt deine Änderungen.',
  },
  remove: {
    title: 'Löschen',
    text: '„Sessionseintrag löschen“ ganz unten löscht den Eintrag endgültig. Die Session wird danach ohne Nummer, Motto und Logo angezeigt.',
  },
} as const;
