export const BEER_LIST_HELP_SPOTS = {
  tab: 'help-beer-list-tab',
  booking: 'help-beer-list-booking',
  history: 'help-beer-list-history',
  givers: 'help-beer-list-givers',
} as const;

export const BEER_LIST_HELP_MANAGE_CHIP = 'Bierliste führen';

export const BEER_LIST_HELP_COPY = {
  tab: {
    title: 'Was du offen hast',
    text: 'Oben steht, was du gerade noch zahlen musst. Der Kreis daneben zählt deine Kisten mit Strichen.',
  },
  pay: {
    title: 'Bezahlen',
    text: '„Bezahlen an“ zeigt, wem du das Geld gibst: bar oder per PayPal, wenn ein Link hinterlegt ist.',
    after:
      'Deine Kisten gelten als bezahlt, sobald die Zahlung eingetragen ist. Das macht, wer die Bierliste führt.',
    earlier:
      '„Noch offen bei“ heißt: Diese Kisten stammen von einer früheren Liste und gehen an die Person von damals.',
  },
  booking: {
    title: 'Kiste buchen',
    text: 'Wähle das Getränk und die Anzahl, dann halte „Kiste buchen“ gedrückt. Die Kiste kommt auf deine Liste.',
    undo: 'Ein paar Sekunden lang kannst du sie mit „Rückgängig“ zurücknehmen. Später korrigiert das, wer die Bierliste führt.',
    code: 'Der Code auf der Palette führt dich direkt zum Buchen.',
  },
  join: {
    title: 'Kiste buchen',
    text: 'Buchen kannst du, wenn du an der Bierliste teilnimmst. Das stellst du in Mein Profil ein.',
  },
  noPot: {
    title: 'Kiste buchen',
    text: 'Gerade ist keine Bierliste offen. Buchen geht erst wieder, wenn eine eröffnet ist.',
  },
  history: {
    title: 'Deine Kisten',
    text: 'Hier stehen deine Kisten: oben die offenen, darunter gebündelt nach dem Tag, an dem sie bezahlt wurden.',
    enteredBy: 'Hat jemand anderes eine Kiste für dich eingetragen, steht sein Name dabei.',
  },
  givers: {
    title: 'Wer hat Kisten gegeben',
    text: 'Die Liste zeigt, wer wie viele Kisten gegeben hat. Ob jemand bezahlt hat, sehen nur er selbst und wer die Bierliste führt.',
  },
  manage: {
    title: 'Bierliste verwalten',
    text: 'Oben öffnet „Bierliste verwalten“ die Verwaltung: Zahlungen, Kisten, Bestand, Getränke und Übergabe.',
  },
} as const;
