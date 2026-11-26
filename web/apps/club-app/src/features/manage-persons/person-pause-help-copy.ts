export const PAUSE_HELP_SPOTS = {
  span: 'help-pause-span',
} as const;

export const PAUSE_HELP_COPY = {
  span: {
    title: 'Ruhezeit',
    text: '„Von Session“ ist die erste Session der Pause. Bleibt „Bis Session“ offen, ruht die Mitgliedschaft bis auf Weiteres.',
    fit: 'Die Ruhezeit muss in den Zeitraum passen, der oben steht, und darf sich mit keiner anderen überschneiden.',
  },
  meaning: {
    title: 'Was das bedeutet',
    text: 'Die Mitgliedschaft läuft weiter, es braucht keinen Austritt und keinen neuen Antrag. Sie gilt in der Zeit nur als nicht aktiv.',
  },
  save: {
    title: 'Fertig',
    create: 'Unten „Ruhezeit eintragen“ speichert die Pause.',
    edit: 'Unten „Ruhezeit ändern“ übernimmt deine Änderungen.',
    leave: 'Gehst du vorher weg, fragt die App, ob deine Eingaben verworfen werden sollen.',
  },
} as const;
