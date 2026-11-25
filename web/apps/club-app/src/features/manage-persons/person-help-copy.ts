export const PERSON_HELP_SPOTS = {
  memberships: 'help-person-memberships',
  feeReductions: 'help-person-fee-reductions',
  ties: 'help-person-ties',
  app: 'help-person-app',
  masterData: 'help-person-master-data',
} as const;

export const PERSON_HELP_COPY = {
  overview: {
    title: 'Überblick',
    text: 'Oben steht, wie es mit der App aussieht, dazu die wichtigsten Eckdaten. Tippe auf eine Kachel, um zum passenden Abschnitt zu springen.',
    next: 'Steht ein nächster Schritt an, etwa „Einladen“ oder „Vor Ort zeigen“, liegt der Knopf gleich dort.',
  },
  memberships: {
    title: 'Mitgliedschaft',
    text: '„+ Zeitraum“ trägt eine Mitgliedschaft ein. Tippe auf einen Zeitraum, um ihn zu ändern oder zu beenden.',
    pauses: 'Ruhezeiten trägst du innerhalb des Zeitraums ein, für ganze Sessionen.',
    groups:
      'Gruppen hängen nicht an der Mitgliedschaft: Auch wer kein Mitglied ist, kann in einer Gruppe sein.',
  },
  feeReductions: {
    title: 'Beitragsermäßigung',
    text: '„+ Ermäßigung“ trägt eine Grundlage ein, etwa Schule oder Studium, von Session bis Session. Danach läuft sie von selbst aus.',
    archived: 'Solange die Person archiviert ist, lässt sich keine Ermäßigung eintragen.',
  },
  ties: {
    title: 'Gruppen, Rollen und Schlüssel',
    text: 'Hier steht, in welchen Gruppen sie ist, welche Rollen, Vorstandsämter und Schlüssel sie hat, und darunter, was früher war.',
    where:
      'Eingetragen wird das jeweils dort: in der Gruppe, bei den Rollen, im Vorstand oder bei den Schlüsseln.',
  },
  app: {
    title: 'App',
    state:
      'Hier siehst du, ob sie die App nutzt, ob eine Einladung offen ist und was bisher passiert ist.',
    text: '„Per Mail einladen“ schickt einen Link, der 14 Tage gilt. Bei „Vor Ort zeigen“ scannt sie einen QR‑Code auf deinem Bildschirm, der 15 Minuten gilt.',
    single:
      'Eine neue Einladung macht die vorige ungültig. Fehlt das Geburtsdatum, trägst du es zuerst ein.',
    recovery:
      '„Zugang wiederherstellen“ hilft, wenn sie Passwort und E‑Mail-Postfach verloren hat. „Zugang sperren“ meldet sie überall ab, entsperren geht jederzeit.',
  },
  masterData: {
    title: 'Stammdaten',
    text: '„Bearbeiten“ ändert Name, Kontakt, Anschrift, Geburtsdatum und Bild.',
    visibility: 'Der Schalter darunter legt fest, ob andere Mitglieder ihre Kontaktdaten sehen.',
    whatsApp:
      'Die WhatsApp-Vereinsgruppe schaltest du nur auf ihren Wunsch ein. Hat sie die App, entscheidet sie das selbst.',
  },
  archive: {
    title: 'Archivieren',
    text: '„Person archivieren“ ganz unten beendet zum „Letzten Tag“, den du wählst, alles, was noch läuft: Mitgliedschaft, Gruppen, Rollen, Vorstandsämter und Schlüssel. Was noch nicht begonnen hat, wird gelöscht.',
    keeps:
      'Beitragsermäßigungen und ihr Zugang zur App bleiben. Sie verschwindet aus dem Register und aus jeder Auswahl.',
  },
  restore: {
    title: 'Wiederherstellen',
    text: '„Wiederherstellen“ ganz unten holt sie zurück ins Register und in jede Auswahl. Was beim Archivieren beendet wurde, bleibt beendet.',
  },
  delete: {
    title: 'Person löschen',
    text: '„Person löschen“ entfernt sie endgültig, mit Mitgliedschaften, Gruppen, Rollen, Schlüsseln und ihrem Zugang zur App. Das lässt sich nicht rückgängig machen.',
    proof: 'Zur Sicherheit bestätigst du mit deinem Passwort oder Passkey.',
  },
} as const;
