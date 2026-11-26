export const EVENT_HELP_SPOTS = {
  steps: 'help-event-steps',
} as const;

export const EVENT_HELP_COPY = {
  overview: {
    title: 'Der Abend auf einen Blick',
    text: 'Oben stehen Tag, Bild und wie viele Schritte schon erledigt sind. Die Leiste darunter zeigt Beginn, Einlass, Ort, Preis und Verkauf – was noch fehlt, ist markiert.',
  },
  steps: {
    title: 'Schritt für Schritt',
    text: 'Tippe einen Schritt an. Du siehst, was erledigt ist und was fehlt, und unten den Knopf für den nächsten Handgriff – etwa „Angaben ergänzen“, „Karten einrichten“ oder „Ablauf planen“.',
    computed: 'Erledigt ist ein Schritt, sobald die Angaben da sind. Abhaken musst du nichts.',
  },
  publish: {
    title: 'Veröffentlichen',
    text: 'Sind Einlass, Ort, Beschreibung und Bild eingetragen, erscheint „Veröffentlichen“. Halte den Knopf gedrückt und bestätige.',
    effect:
      'Der Abend steht dann sofort auf der Website und im Kalender aller Mitglieder. Zurücknehmen lässt sich das nicht.',
  },
  evening: {
    title: 'Ablauf und Saal',
    text: 'Im Schritt Ablauf planst du die Reihenfolge der Auftritte, unter Saal & Tische den Tischplan.',
    noTables:
      'Braucht der Abend keine Tische, tippe dort „Kein Tischplan nötig“ – der Schritt fällt dann weg.',
  },
  change: {
    title: 'Ändern, absagen, löschen',
    text: 'Im Schritt Eckdaten führt „Bearbeiten“ zu allen Angaben und „Verwalten“ zu Bild, Absage und Löschen.',
  },
} as const;
