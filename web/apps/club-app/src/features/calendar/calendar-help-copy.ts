export const CALENDAR_HELP_SPOTS = {
  week: 'help-calendar-week',
  month: 'help-calendar-month',
  day: 'help-calendar-day',
  usual: 'help-calendar-usual',
} as const;

export const CALENDAR_HELP_COPY = {
  week: {
    title: 'Woche und Monat',
    text: 'Oben siehst du die Woche. Mit den Pfeilen blätterst du, „Heute“ bringt dich zurück. Tippe einen Tag an, um zu ihm zu springen.',
    marks:
      'Punkte unter einem Tag sind Termine, in der Farbe ihrer Gruppe. Eine goldene Raute heißt: Hier fehlt noch deine Antwort.',
    more: 'Zieh die Leiste nach unten für den ganzen Monat. „Stunden“ zeigt die Woche nach Uhrzeit.',
  },
  month: {
    title: 'Der Monat',
    text: 'Links steht der Monat. Tippe einen Tag an, um in der Liste zu ihm zu springen, mit den Pfeilen blätterst du.',
    marks:
      'Punkte unter einem Tag sind Termine, in der Farbe ihrer Gruppe. Eine goldene Raute heißt: Hier fehlt noch deine Antwort.',
  },
  answers: {
    title: 'Zu- und absagen',
    text: 'Wo deine Antwort gefragt ist, sagst du direkt in der Zeile zu, ab oder vielleicht.',
    after: 'Danach steht dort deine Antwort. Tippe sie an, um sie zu ändern.',
  },
  openMarks: {
    title: 'Abstimmen und Eintragen',
    text: 'Steht „Abstimmen“ oder „Eintragen“ an einem Termin, wartet dort eine Umfrage oder eine Liste auf dich. Öffne den Termin, um mitzumachen.',
  },
  detail: {
    title: 'Alles zu einem Termin',
    text: 'Tippe einen Termin an: Du siehst, wann und wo er ist, für wen er gilt, dazu Umfragen, Listen und den Tagesablauf.',
    edit: 'Darfst du ihn ändern, findest du unten „Bearbeiten“.',
    mark: 'Leitest du eine Gruppe, trägst du bei ihren Trainings mit „Für andere eintragen“ ein, wer kommt, auch für Kinder ohne eigenen Zugang. „Rückgängig“ holt die Antwort davor zurück.',
  },
  usual: {
    title: 'Übliche Trainingszeiten',
    text: 'Gestrichelte Zeilen sind die festen Trainingszeiten deiner Gruppen. Sie zeigen, wann ihr normalerweise trainiert, sind aber noch kein Termin.',
    plan: 'Tippst du auf „Planen“, wird daraus ein echtes Training, Tag und Uhrzeit sind schon eingetragen.',
  },
  add: {
    title: 'Neuer Termin',
    text: 'Mit „+“ oben legst du einen Termin für den Tag an, den du gerade ansiehst.',
    addOns:
      'Unter „Funktionen“ hängst du eine Zu-/Absage, eine Umfrage, eine Eintragsliste oder einen Tagesablauf an.',
  },
} as const;
