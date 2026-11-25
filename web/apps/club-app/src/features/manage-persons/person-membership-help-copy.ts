export const MEMBERSHIP_HELP_SPOTS = {
  span: 'help-membership-span',
  pauses: 'help-membership-pauses',
} as const;

export const MEMBERSHIP_HELP_COPY = {
  span: {
    title: 'Zeitraum',
    text: '„Mitglied ab“ ist der Beginn, auch ein Tag in der Zukunft geht. Bleibt „Mitglied bis“ offen, läuft die Mitgliedschaft unbefristet.',
    chain: 'Darüber stehen alle Zeiträume dieser Person, der gerade bearbeitete ist hervorgehoben.',
  },
  end: {
    title: 'Mitgliedschaft beenden',
    text: 'Trägst du bei einer laufenden Mitgliedschaft „Mitglied bis“ ein, wird der Knopf zu „Mitgliedschaft beenden“. Über dem Knopf steht, ab wann sie kein Mitglied mehr ist.',
    keeps:
      'Eine offene Ruhezeit endet mit. Gruppen und Rollen bleiben, wie sie sind, und der Zeitraum bleibt als Verlauf erhalten.',
  },
  pauses: {
    title: 'Ruhezeiten',
    text: '„+ Ruhezeit“ trägt eine Pause für ganze Sessionen ein. Die Mitgliedschaft läuft weiter, sie gilt in der Zeit nur als nicht aktiv.',
    edit: 'Tippe auf eine Ruhezeit, um sie zu ändern.',
  },
  archived: {
    title: 'Archiviert',
    text: 'Ein laufender Zeitraum holt die Person aus dem Archiv. Beendete Zeiträume und Ruhezeiten lassen sich erst nach dem Wiederherstellen eintragen.',
  },
  save: {
    title: 'Fertig',
    create: 'Unten „Zeitraum eintragen“ speichert den Zeitraum.',
    edit: 'Unten „Zeitraum ändern“ übernimmt deine Änderungen.',
    leave: 'Gehst du vorher weg, fragt die App, ob deine Eingaben verworfen werden sollen.',
  },
} as const;
