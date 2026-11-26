export const EVENT_EDITOR_HELP_SPOTS = {
  title: 'help-event-title',
  picture: 'help-event-picture',
  schedule: 'help-event-schedule',
  texts: 'help-event-texts',
  tickets: 'help-event-tickets',
} as const;

export const EVENT_EDITOR_HELP_COPY = {
  picture: {
    title: 'Titel und Bild',
    text: 'Das Bild zeigt den Abend auf der Website und im Kalender. Lade es mit „Hochladen“ hoch oder nimm eins „Aus der Galerie“; über „Zuschnitt“ wählst du den Ausschnitt.',
    live: 'Ein neues Bild gilt sofort – dafür musst du nicht speichern.',
  },
  schedule: {
    title: 'Wann und wo',
    text: 'Tag, Beginn und Ort sind Pflicht. Für Einlass und Beginn kannst du 14:11, 20:11 oder 21:11 mit einem Tipp wählen.',
  },
  texts: {
    title: 'Texte für die Website',
    text: 'Die Kurzbeschreibung ist ein Satz, der Lust auf den Abend macht. Die ausführliche Beschreibung erzählt von Programm und Mitwirkenden – ohne Formatierung.',
  },
  tickets: {
    title: 'Karten',
    text: 'Mit Preis, Vorverkaufsstart und mindestens einer Vorverkaufsstelle ist der Schritt Karten erledigt. Der Altershinweis ist freiwillig.',
    newPlace: 'Fehlt eine Vorverkaufsstelle in der Liste, legst du sie mit „Ort anlegen“ neu an.',
  },
  save: {
    title: 'Speichern',
    create:
      '„Anlegen“ speichert den Abend. Er bleibt in Vorbereitung und erscheint erst auf der Website, wenn du ihn auf seiner Seite veröffentlichst.',
    edit: '„Speichern“ übernimmt deine Änderungen.',
    publish: 'Zum Veröffentlichen braucht der Abend außerdem Einlass, Ort, Beschreibung und Bild.',
  },
} as const;
