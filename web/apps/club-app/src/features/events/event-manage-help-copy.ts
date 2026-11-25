export const EVENT_MANAGE_HELP_SPOTS = {
  picture: 'help-event-manage-picture',
} as const;

export const EVENT_MANAGE_HELP_COPY = {
  picture: {
    title: 'Bild',
    text: 'Lade ein neues Bild mit „Hochladen“ hoch oder nimm eins „Aus der Galerie“. Über „Zuschnitt“ verschiebst du den Ausschnitt.',
    live: 'Jede Änderung am Bild gilt sofort.',
  },
  cancel: {
    title: 'Absagen',
    text: 'Fällt der Abend aus, tippe „Absagen“. Seine Seite bleibt online und zeigt die Absage.',
    restore: 'Findet er doch statt, nimmst du die Absage mit „Absage zurücknehmen“ wieder zurück.',
  },
  delete: {
    title: 'Löschen',
    text: '„Veranstaltung löschen“ entfernt den Abend endgültig von der Website und aus dem Kalender. Fällt er nur aus, sag ihn lieber ab.',
  },
} as const;
