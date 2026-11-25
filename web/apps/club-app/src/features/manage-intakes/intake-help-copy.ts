export const INTAKE_HELP_SPOTS = {
  link: 'help-intake-link',
  decision: 'help-intake-decision',
} as const;

export const INTAKE_HELP_COPY = {
  link: {
    title: 'QR‑Code',
    text: 'Zeig ihr den QR‑Code oder schick ihr den Link über den Knopf unten. Der Link gilt 7 Tage und nur einmal.',
  },
  renew: {
    title: 'Neuer Link',
    text: '„Neuer Link“ macht einen frischen Link, der alte gilt dann nicht mehr. So holst du auch eine abgelaufene QR‑Anmeldung zurück.',
  },
  edit: {
    title: 'Bearbeiten',
    text: 'Solange sie nichts abgeschickt hat, änderst du mit „Bearbeiten“ oben Mitgliedschaft, Gruppen und „Für wen?“.',
  },
  review: {
    title: 'Prüfen',
    text: 'Im Register steht vielleicht schon jemand wie sie. „Prüfen“ zeigt ihre Angaben und die Treffer, dort entscheidest du.',
  },
  decision: {
    title: 'Entscheidung und Verlauf',
    text: 'Unter „Entscheidung“ steht, was beim Abschluss angelegt wird, unter „Verlauf“, wann was passiert ist.',
    done: 'Schickt sie das Formular ab und passt niemand im Register, kommt sie sofort hinein. Hat sie eine E‑Mail angegeben und ist alt genug, geht die Einladung zur App gleich mit.',
  },
  discard: {
    title: 'Verwerfen',
    text: '„Verwerfen“ ganz unten beendet die QR‑Anmeldung. Der Link gilt dann nicht mehr, und was sie schon eingegeben hat, wird gelöscht.',
  },
} as const;
