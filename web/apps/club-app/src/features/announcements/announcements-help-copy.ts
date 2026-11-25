export const ANNOUNCEMENTS_HELP_SPOTS = {
  current: 'help-announcements-current',
  text: 'help-announcement-text',
  addOns: 'help-announcement-add-ons',
  content: 'help-announcement-content',
  editorAddOns: 'help-announcement-editor-add-ons',
} as const;

export const POSTER_CHIP = 'Aushänge schreiben';

export const ANNOUNCEMENTS_HELP_COPY = {
  list: {
    title: 'Aktuelle Aushänge',
    text: 'Unter „Aktuell“ stehen alle Aushänge, die gerade gelten. Tippe einen an, um ihn ganz zu lesen und zu antworten.',
    new: 'Ein „neu“ markiert Aushänge, die seit deinem letzten Besuch dazugekommen sind.',
  },
  answers: {
    title: 'Antworten auf einen Blick',
    text: 'Hängt eine Zu-/Absage, Umfrage oder Eintragsliste am Aushang, siehst du darunter, ob deine Antwort noch fehlt.',
    edge: 'Ein blauer Strich am linken Rand heißt: Hier wartet eine Antwort von dir.',
  },
  expired: {
    title: 'Abgelaufen',
    text: 'Ist das Datum „Gültig bis“ vorbei, rutscht ein Aushang nach unten unter „Abgelaufen“.',
  },
  post: {
    title: 'Neuer Aushang',
    text: 'Mit „+ Aushang“ schreibst du einen neuen Aushang für alle Mitglieder.',
    change: 'Öffnest du einen Aushang, änderst oder löschst du ihn über „Aushang ändern“.',
  },
  read: {
    title: 'Den Aushang lesen',
    text: 'Oben stehen Datum, wie lange der Aushang gilt und wer ihn geschrieben hat.',
    mentions:
      'Fett hinterlegte Namen sind Erwähnungen. Tippe darauf, um mehr zu sehen und etwa zur Person oder zum Termin zu springen.',
  },
  answer: {
    title: 'Antworten',
    text: 'Unter dem Text stehen Zu-/Absage, Umfragen und Eintragslisten. Tippe in der Liste „Antworten“ auf eine Zeile, um direkt dorthin zu springen.',
    taken:
      'Stammt eine Funktion aus einem Kalendereintrag, steht der Termin darüber. Deine Antwort zählt dann für diesen Termin.',
  },
  edit: {
    title: 'Ändern',
    text: 'Mit dem Stift oben öffnest du „Aushang ändern“. Dort kannst du den Aushang auch löschen.',
    close: 'Umfragen und Zu-/Absagen kannst du hier auch schließen.',
  },
  content: {
    title: 'Titel und Text',
    text: 'Gib einen Titel und den Text ein. Über die Leiste am Textfeld setzt du Überschriften, Listen, fett und Links.',
    validUntil:
      'Mit „Gültig bis“ legst du fest, bis wann der Aushang aktuell ist. Ohne Datum bleibt er, bis er gelöscht wird.',
  },
  mention: {
    title: 'Jemanden erwähnen',
    text: 'Tippe „@“ oder „Erwähnen“ und dann den Anfang eines Namens. Du kannst Personen, Gruppen, Termine, Veranstaltungen, Meldungen und Alben erwähnen.',
    label: 'Tippst du eine Erwähnung an, änderst du, wie sie im Satz steht.',
  },
  notify: {
    title: 'Benachrichtigen',
    text: 'Ist „Benachrichtigen“ an, geht beim Erscheinen eine Push‑Mitteilung an alle Mitglieder.',
    clubGroup: 'Zusätzlich geht der Aushang in die WhatsApp-Gruppe des Vereins.',
  },
  addOns: {
    title: 'Funktionen',
    text: 'Mit „Funktion hinzufügen“ hängst du eine Zu-/Absage, eine Umfrage oder eine Eintragsliste an.',
    borrow:
      'Dort findest du auch „Aus Kalendereintrag übernehmen“: So zeigst du eine Funktion eines kommenden Termins im Aushang. Die Antworten landen dann beim Termin.',
  },
  withdraw: {
    title: 'Löschen',
    text: 'Ganz unten löschst du den Aushang mit „Aushang löschen“. Seine eigenen Funktionen und deren Antworten sind dann weg.',
  },
  save: {
    newText: 'Mit „Hinzufügen“ unten erscheint der Aushang.',
    editText: 'Mit „Speichern“ unten übernimmst du die Änderungen.',
  },
} as const;
