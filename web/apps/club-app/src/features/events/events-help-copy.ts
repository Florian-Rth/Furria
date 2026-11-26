export const EVENTS_HELP_SPOTS = {
  health: 'help-events-health',
} as const;

export const EVENTS_HELP_COPY = {
  health: {
    title: 'Wie weit die Abende sind',
    text: 'Der Ring zählt die erledigten Schritte aller Abende dieser Session.',
    filters:
      'Die Filter zeigen nur die Abende, die überfällig oder bald fällig sind, die noch in Vorbereitung sind oder schon vorbei.',
  },
  evenings: {
    title: 'Jeder Abend auf einen Blick',
    text: 'Zu jedem Abend steht, wie weit Website, Eckdaten, Karten, Ablauf und Saal & Tische sind – und welche Frist als Nächstes kommt.',
    open: 'Tippe einen Schritt an, um zu sehen, was fehlt, und gleich weiterzumachen. Der Abend selbst öffnet seine ganze Seite.',
  },
  states: {
    title: 'Was die Marken heißen',
    text: '„jetzt“ ist der Schritt, der als Nächstes dran ist. „wartet“ heißt: Der Schritt ist noch nicht an der Reihe – den Ablauf etwa plant ihr erst kurz vor dem Abend.',
    computed:
      'Die App erkennt selbst, was erledigt ist. Abhaken musst du nichts, es reicht, die Angaben einzutragen.',
  },
  create: {
    title: 'Neuen Abend anlegen',
    text: 'Mit dem Plus oben („Veranstaltung anlegen“) legst du einen neuen Abend an. Er bleibt in Vorbereitung, bis du ihn veröffentlichst.',
    acts: 'Die Masken daneben („Sessionsauftritte“) führen zu allen Auftritten, die ihr für eure Abende einplanen könnt.',
  },
} as const;
