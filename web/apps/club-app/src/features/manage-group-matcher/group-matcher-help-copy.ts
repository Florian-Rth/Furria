export const GROUP_MATCHER_HELP_SPOTS = {
  pool: 'help-group-matcher-pool',
  coverage: 'help-group-matcher-coverage',
} as const;

export const GROUP_MATCHER_HELP_COPY = {
  pool: {
    title: 'Die Aussagen',
    text: 'Auf der Website beantworten Besucher diese Aussagen mit Ja, Neutral oder Nein und sehen, welche Gruppe zu ihnen passt. Jede Gruppe nimmt zu jeder Aussage Stellung.',
    add: 'Unter „Neue Aussage“ schreibst du eine weitere und tippst auf „Hinzufügen“. Es passen höchstens zehn in den Pool.',
    order: 'Am Griff ziehst du eine Aussage an eine andere Stelle.',
  },
  statement: {
    title: 'Eine Aussage ändern',
    text: 'Tippe eine Aussage an, um sie umzuformulieren. Mit „Speichern“ bleiben die Antworten der Gruppen stehen, die Aussage gilt bei ihnen aber als „geändert“, bis sie sie wieder ansehen.',
    delete: '„Löschen“ entfernt die Aussage samt den Antworten aller Gruppen.',
  },
  coverage: {
    title: 'Wer schon geantwortet hat',
    text: 'Unter „Abdeckung“ steht jede Gruppe mit ihrer Antwort auf jede Aussage. „Neu“ heißt: Die Aussage kam dazu, nachdem die Gruppe schon dabei war.',
    part: 'Eine Gruppe ist „Dabei“, sobald sie jede Aussage beantwortet hat. Eine später hinzugefügte Aussage wirft sie nicht wieder raus.',
    website:
      'Auf der Website erscheint der Jeck‑Check erst, wenn mindestens zwei Gruppen dabei sind.',
  },
  stances: {
    title: 'Antworten der Gruppen',
    text: 'Die Antworten selbst geben die Gruppen‑Admins auf der Jeck‑Check‑Seite ihrer Gruppe ein – nicht hier.',
  },
} as const;
