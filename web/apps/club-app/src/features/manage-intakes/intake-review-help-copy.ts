export const INTAKE_REVIEW_HELP_SPOTS = {
  newcomer: 'help-intake-review-newcomer',
  candidates: 'help-intake-review-candidates',
} as const;

export const INTAKE_REVIEW_HELP_COPY = {
  newcomer: {
    title: 'Ihre Angaben',
    text: 'Oben steht, was sie selbst eingetragen hat.',
  },
  candidates: {
    title: 'Steht sie schon im Register?',
    text: 'Darunter stehen Personen mit gleicher E‑Mail oder gleichem Namen und Geburtstag. Wähle die passende oder „Neue Person“. Von selbst wird nie zugeordnet.',
    existing:
      'Bei einer bestehenden Person werden nur leere Felder gefüllt, fehlende Mitgliedschaft und Gruppen kommen dazu. Wer schon Mitglied war, behält sein „Mitglied seit“.',
    quiet: 'Sie selbst erfährt nicht, dass es einen Treffer gab.',
  },
  save: {
    title: 'Übernehmen',
    text: 'Unten „Übernehmen“ schließt die QR‑Anmeldung ab. Darüber steht, was dabei passiert.',
  },
} as const;
