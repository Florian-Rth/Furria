export const CLAIM_WINDOW_HELP_SPOTS = {
  state: 'help-claim-window-state',
  end: 'help-claim-window-end',
  address: 'help-claim-window-address',
  claims: 'help-claim-window-claims',
} as const;

export const CLAIM_WINDOW_HELP_COPY = {
  state: {
    title: 'Offen oder geschlossen',
    text: '„Status“ zeigt, ob das Anmeldefenster gerade offen ist und bis wann.',
    reach:
      'Solange es offen ist, richten Personen ohne hinterlegte E‑Mail-Adresse ihren Zugang nur mit Name und Geburtsdatum ein. Deshalb ist es immer nur befristet offen.',
  },
  end: {
    title: 'Öffnen und schließen',
    text: 'Wähle unter „Offen bis“ Tag und Uhrzeit und tippe „Öffnen“. Höchstens sieben Tage – dann schließt das Fenster von selbst.',
    open: 'Ist es offen, verschiebst du das Ende mit „Ende ändern“ oder schließt es sofort mit „Jetzt schließen“.',
  },
  match: {
    title: 'Wen es findet',
    text: 'Vorname, Nachname und Geburtsdatum müssen genau zu einer Person passen. Es findet nur Personen, die zum Verein gehören, das Mindestalter erreicht haben und keine E‑Mail-Adresse beim Verein hinterlegt haben.',
    others:
      'Wer schon einen Zugang oder eine hinterlegte E‑Mail-Adresse hat, wird zur Anmeldung oder zu „Zugang anfordern“ geschickt.',
  },
  address: {
    title: 'Adresse weitergeben',
    text: 'Zeig den QR-Code oder gib die Adresse darunter weiter. Dort tragen sich die Personen ein.',
  },
  claims: {
    title: 'Wer sich gemeldet hat',
    text: '„Gemeldet“ listet alle, die über das Anmeldefenster gefunden wurden. Blass steht, wer den Zugang noch nicht fertig eingerichtet hat.',
    wrong:
      'Hat sich jemand als eine andere Person gemeldet, sperrst du den Zugang in der Personenverwaltung mit „Zugang sperren“.',
  },
} as const;
