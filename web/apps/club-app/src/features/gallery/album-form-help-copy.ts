export const ALBUM_FORM_HELP_SPOTS = {
  album: 'help-album-form-album',
  link: 'help-album-form-link',
  cover: 'help-album-form-cover',
} as const;

export const ALBUM_FORM_HELP_COPY = {
  album: {
    title: 'Titel und Beschreibung',
    text: 'Der Titel ist Pflicht. In der Beschreibung reichen ein, zwei Sätze zum Anlass.',
  },
  link: {
    title: 'Wozu das Album gehört',
    text: 'Unter „Gehört zu“ verknüpfst du das Album mit einem Termin der letzten zwölf Monate. Datum und Session kommen dann vom Termin.',
    session: 'Für ältere Bilder wählst du direkt eine Session.',
    website:
      'Nur ein Album mit Session kann auf die Website. Mit „Nichts davon“ bleibt es in der App.',
  },
  cover: {
    title: 'Titelbild',
    text: 'Ohne eigene Wahl sucht die App das Titelbild selbst aus. Über „Wählen“ legst du es fest.',
  },
  delete: {
    title: 'Album löschen',
    text: '„Album löschen“ ganz unten legt das Album mit allen Bildern in den Papierkorb. Nach 30 Tagen ist es endgültig gelöscht.',
  },
  saveNew: {
    title: 'Anlegen',
    text: '„Anlegen“ unten legt das Album an. Danach lädst du Bilder hinein oder legst sie aus deinem Eingang ab.',
  },
  saveEdit: {
    title: 'Speichern',
    text: '„Speichern“ unten übernimmt deine Änderungen.',
  },
} as const;
