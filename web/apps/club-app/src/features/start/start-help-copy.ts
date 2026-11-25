export const START_HELP_SPOTS = {
  calendar: 'help-start-calendar',
  announcements: 'help-start-announcements',
  news: 'help-start-news',
  toDos: 'help-start-to-dos',
} as const;

export const START_HELP_COPY = {
  head: {
    title: 'Die große Zahl oben',
    text: 'Oben begrüßt dich die App mit einer Zahl zur Session, zum Beispiel wie viele Tage es noch bis zum 11.11. sind.',
    facts: 'Darunter steht, seit wann du im Verein bist und welche Ämter du hast.',
  },
  confetti: {
    title: 'Konfetti',
    text: 'Schüttel dein Handy, dann fliegt Konfetti über die Seite. Neigst du es, rutscht das Konfetti mit.',
    allow:
      'Auf dem iPhone tippst du dafür einmal auf die große Zahl und erlaubst den Zugriff auf die Bewegung.',
  },
  week: {
    title: 'Die Woche',
    text: 'Die Leiste zeigt die nächsten Tage mit ihren Terminen. Tippe einen Tag an, um seine Termine zu sehen.',
  },
  calendar: {
    title: 'Deine nächsten Termine',
    text: 'Die Kachel „Kalender“ zeigt, was als Nächstes ansteht. Tippe einen Termin an, um alles dazu zu sehen.',
    marks:
      'Rechts steht deine Antwort: Haken heißt Zusage, Fragezeichen Vielleicht, Kreuz Absage. Ein goldener Kreis heißt: Deine Antwort fehlt noch.',
    more: 'Tippe oben in der Kachel auf „Kalender“, um alle kommenden Termine zu sehen.',
  },
  ring: {
    title: 'Der goldene Ring',
    text: 'Der Ring zählt, wo deine Antwort noch fehlt: Zu- und Absagen, Umfragen und Eintragslisten aus Terminen und Aushängen.',
    tap: 'Tippe auf den Ring. Unter „Deine offenen Antworten“ antwortest du direkt, ohne jeden Termin einzeln zu öffnen.',
    done: 'Hast du alles beantwortet, verschwindet der Ring.',
  },
  announcements: {
    title: 'Aushänge',
    text: 'Die Kachel „Aushänge“ zeigt die aktuellen Aushänge des Vereins. Tippe einen an, um ihn zu lesen.',
    more: 'Über „Aushänge“ oben in der Kachel siehst du alle.',
  },
  mine: {
    title: 'Neues zu dir',
    text: 'Die Kachel „Du“ zeigt, was sich bei dir geändert hat, etwa ein neues Amt, eine neue Gruppe oder ein Schlüssel.',
  },
  groups: {
    title: 'Gruppen-Jubiläen',
    text: 'Die Kachel „Gruppen“ zeigt, welche Gruppe gerade ein Jubiläum feiert. Tippe eine an, um zur Gruppe zu kommen.',
  },
  gallery: {
    title: 'Galerie',
    text: 'Die Kachel „Galerie“ zeigt neue Alben. Tippe darauf, um zur Galerie zu kommen.',
  },
  news: {
    title: 'Aktuelles',
    text: 'Die Kachel „Aktuelles“ zeigt die neueste Meldung des Vereins. Tippe sie an, um sie zu lesen.',
    more: 'Über „Aktuelles“ oben in der Kachel findest du alle Meldungen.',
  },
  beerTab: {
    title: 'Deine Kisten',
    text: 'Die Kachel „Deine Kisten“ zeigt, welche Kisten von der Bierliste du noch bezahlen musst.',
  },
  beerDesk: {
    title: 'Bierliste',
    text: 'Mit „Kisten eintragen“ trägst du ein, wer wie viele Kisten genommen hat.',
  },
  practice: {
    title: 'Üben',
    text: 'Die Kachel „Üben“ zeigt deine Auftritte. Tippe einen an, um ihn zu üben.',
  },
  toDos: {
    title: 'Zu erledigen',
    text: 'Die Kachel „Zu erledigen“ zählt offene Aufgaben, etwa Beitrittsanträge oder fehlende Geburtsdaten. Tippe eine Zahl an, um zur Liste zu kommen.',
  },
  clubGroup: {
    title: 'WhatsApp-Vereinsgruppe',
    text: 'Steht oben „Tritt der Vereinsgruppe bei“, öffnest du mit „Gruppe öffnen“ den Beitritt in WhatsApp.',
  },
} as const;
