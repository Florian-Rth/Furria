export const INTAKE_EDITOR_HELP_SPOTS = {
  groups: 'help-intake-editor-groups',
  membership: 'help-intake-editor-membership',
  label: 'help-intake-editor-label',
} as const;

export const INTAKE_EDITOR_HELP_COPY = {
  groups: {
    title: 'Gruppen',
    text: 'Tippe die Gruppen an, in die sie kommt.',
    groupAdmin: 'Zur Auswahl stehen nur Gruppen, die du leitest.',
  },
  membership: {
    title: 'Mitgliedschaft',
    text: 'Schalte „Wird Mitglied“ ein, wenn sie Mitglied wird, und wähle, ab wann. Auch ein Tag in der Vergangenheit oder Zukunft geht.',
    needs: 'Mindestens eins braucht es: eine Mitgliedschaft oder eine Gruppe.',
  },
  label: {
    title: 'Für wen?',
    text: 'Ein Name oder Stichwort, damit du offene QR‑Anmeldungen auseinanderhältst. Freiwillig.',
  },
  her: {
    title: 'Was sie selbst einträgt',
    text: 'Name und Geburtsdatum immer, die Anschrift, wenn sie Mitglied wird. Telefon, E‑Mail und Porträt sind freiwillig.',
  },
  save: {
    title: 'Fertig',
    create: 'Unten „QR‑Code erstellen“ legt die QR‑Anmeldung an und zeigt den QR‑Code.',
    edit: 'Unten „Speichern“ übernimmt deine Änderungen.',
    leave: 'Gehst du vorher weg, fragt die App, ob deine Eingaben verworfen werden sollen.',
  },
} as const;
