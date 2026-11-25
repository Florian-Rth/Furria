export const WHATSAPP_HELP_SPOTS = {
  connection: 'help-whatsapp-connection',
  link: 'help-whatsapp-link',
  clubGroup: 'help-whatsapp-club-group',
  keeping: 'help-whatsapp-keeping',
  refused: 'help-whatsapp-refused',
} as const;

export const WHATSAPP_HELP_COPY = {
  connection: {
    title: 'Verbindung',
    text: '„Verbindung“ zeigt, ob der Bot mit WhatsApp verbunden ist, und die Nummer des Vereinshandys, über das er läuft.',
    start:
      'Ist er nicht verknüpft oder getrennt, startest du die Verknüpfung unten mit „Bot verknüpfen“.',
  },
  link: {
    title: 'Bot verknüpfen',
    text: 'Scanne den QR-Code mit dem Vereinshandy: in WhatsApp unter Einstellungen › Verknüpfte Geräte › Gerät hinzufügen.',
    pairing:
      'Ohne Scan geht es auch per Code: Nummer des Vereinshandys eingeben, „Code anfordern“ tippen und den Kopplungscode in WhatsApp eingeben.',
  },
  clubGroup: {
    title: 'Vereinsgruppe wählen',
    text: 'Ist der Bot verbunden, wählst du unter „Vereinsgruppe“ die Gruppe, in die er postet. Er muss in WhatsApp schon Mitglied dieser Gruppe sein.',
    posts:
      'Dorthin gehen Kalendereinträge für den ganzen Verein und Aushänge, wenn beim Anlegen benachrichtigt wird – samt ihren Funktionen. Antworten aus der Gruppe zählen in der App.',
  },
  keeping: {
    title: 'Mitglieder hinzufügen',
    text: '„Vereinsgruppe verwalten“ ist anfangs aus. Eingeschaltet fügt der Bot aktive Mitglieder mit Einwilligung und Handynummer zur Gruppe hinzu – höchstens drei alle zehn Minuten.',
    never: 'Der Bot fügt nur hinzu. Er entfernt nie jemanden aus der Gruppe.',
  },
  refused: {
    title: 'Hinzufügen blockiert',
    text: 'Lässt WhatsApp das Hinzufügen einer Person nicht zu, steht sie unter „Hinzufügen blockiert“. Gib ihr den Einladungslink persönlich weiter.',
  },
} as const;
