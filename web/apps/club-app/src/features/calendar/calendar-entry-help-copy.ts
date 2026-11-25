export const ENTRY_HELP_SPOTS = {
  basics: 'help-entry-basics',
  audience: 'help-entry-audience',
  schedule: 'help-entry-schedule',
  description: 'help-entry-description',
  addOns: 'help-entry-add-ons',
} as const;

export const ENTRY_HELP_COPY = {
  basics: {
    title: 'Titel und Art',
    text: 'Gib dem Termin einen kurzen Titel und wähle die Art: Allgemein, Training oder Ausflug.',
    training: 'Ein Training ist immer für Gruppen, nie für den ganzen Verein.',
  },
  audience: {
    title: 'Für wen',
    text: 'Verein heißt: für alle Mitglieder. Bei Gruppen wählst du die Gruppen aus, sehen können den Termin trotzdem alle.',
    people: 'Bei „Ausgewählte Personen“ sehen nur die Leute den Termin, die du einträgst.',
  },
  notify: {
    title: 'Benachrichtigen',
    text: 'Ist der Schalter an, bekommen alle, für die der Termin ist, eine Push-Nachricht. Darunter steht, wie viele Leute das sind.',
    whatsApp: 'Ist der Termin für den Verein, geht er außerdem in die WhatsApp-Gruppe des Vereins.',
    quiet: 'Muss niemand sofort Bescheid wissen, schalte ihn aus.',
  },
  schedule: {
    title: 'Wann und wo',
    text: 'Tippe auf Datum oder Uhrzeit, um sie zu ändern. Ein Ende ist freiwillig, mit „Ende angeben“ trägst du es ein.',
    venue: 'Den Ort wählst du aus den Orten des Vereins.',
  },
  description: {
    title: 'Beschreibung',
    text: 'Alles, was sonst noch wichtig ist: Treffpunkt, was mitzubringen ist, Kleiderordnung.',
  },
  addOns: {
    title: 'Funktionen',
    text: 'Mit „Funktion hinzufügen“ hängst du etwas zum Mitmachen an. Nichts davon ist Pflicht, du kannst auch mehrere kombinieren.',
    attendance:
      'Zu-/Absage: Jeder antwortet mit Ja, Vielleicht oder Nein. Du siehst, wer noch fehlt, und kannst erinnern.',
    poll: 'Umfrage: Alle stimmen über mehrere Möglichkeiten ab, zum Beispiel über einen Termin oder ein Motto.',
    signUpList:
      'Eintragsliste: Leute tragen sich selbst ein, zum Beispiel für Kuchen oder Fahrdienst.',
    participatingGroups: 'Mitwirkende Gruppen: Hier stehen die Gruppen, die beim Termin mitmachen.',
    daySchedule: 'Tagesablauf: Der Plan des Tages mit Uhrzeiten, Schritt für Schritt.',
  },
  save: {
    title: 'Fertig',
    create: 'Unten „Hinzufügen“ legt den Termin an.',
    edit: 'Unten „Speichern“ übernimmt deine Änderungen. Ganz unten kannst du den Termin auch löschen.',
    leave: 'Gehst du vorher weg, fragt die App, ob deine Eingaben verworfen werden sollen.',
  },
} as const;
