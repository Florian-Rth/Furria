export const FEE_REDUCTION_HELP_SPOTS = {
  basis: 'help-fee-reduction-basis',
} as const;

export const FEE_REDUCTION_HELP_COPY = {
  basis: {
    title: 'Grundlage',
    text: 'Wähle, warum sie weniger zahlt: „Minderjährig“, „Schule“, „Ausbildung“ oder „Studium“.',
  },
  span: {
    title: 'Von Session bis Session',
    text: 'Eine Ermäßigung hat immer ein Ende und läuft danach von selbst aus. Gibt es danach wieder einen Nachweis, trägst du eine neue ein.',
    chain: 'Darüber stehen ihre anderen Ermäßigungen.',
  },
  save: {
    title: 'Fertig',
    create: 'Unten „Ermäßigung eintragen“ speichert sie.',
    edit: 'Unten „Ermäßigung ändern“ übernimmt deine Änderungen.',
    leave: 'Gehst du vorher weg, fragt die App, ob deine Eingaben verworfen werden sollen.',
  },
} as const;
