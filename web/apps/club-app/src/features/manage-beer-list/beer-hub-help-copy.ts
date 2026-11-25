export const BEER_HUB_HELP_SPOTS = {
  head: 'help-beer-hub-head',
  quick: 'help-beer-hub-quick',
  roster: 'help-beer-hub-roster',
  journal: 'help-beer-hub-journal',
  openPot: 'help-beer-hub-open-pot',
} as const;

export const BEER_HUB_HELP_COPY = {
  head: {
    title: 'Lage der Bierliste',
    text: 'Oben steht der Bestand je Getränk und bis wann er beim jetzigen Verbrauch ungefähr reicht. Wird es knapp, steht dort „leer ≈“ mit dem Tag.',
    counters: 'Daneben: wie viel Geld offen ist und wie viele teilnehmen.',
  },
  payment: {
    title: 'Zahlung buchen',
    text: 'Hat dir jemand Geld gegeben, tippe auf „Zahlung“ und wähle die Person. Mit − und + legst du je Getränk fest, wie viele Kisten bezahlt sind, „Alles“ nimmt alle offenen.',
    more: 'Bezahlt werden immer ganze Kisten, die ältesten zuerst. „Zahlung buchen“ trägt sie ein.',
  },
  crates: {
    title: 'Kisten eintragen',
    text: 'Über „Kisten“ trägst du Kisten für jemand anderen ein: Person, Getränk und Anzahl wählen. Hat sie schon bezahlt, schalte „Schon bezahlt“ ein.',
    note: 'Im Journal steht dabei, wer die Kisten eingetragen hat.',
  },
  stock: {
    title: 'Lieferung und Korrektur',
    text: 'Kommt eine Lieferung, tippe auf „Bestand“, wähle das Getränk und trage die Kisten mit + ein. Stimmt der Bestand nicht, ziehst du mit − Kisten ab.',
    after:
      'Darunter siehst du, wie viele Kisten danach da sind. Unter null geht der Bestand nicht.',
  },
  roster: {
    title: 'Offene Kisten',
    text: 'Hier steht, wer noch Kisten offen hat: wie viele, seit wann und welcher Betrag. Tippe eine Person an, um sie zu öffnen.',
  },
  person: {
    title: 'Eine Person',
    text: 'Bei einer Person buchst du direkt ihre Zahlung oder mit „Kisten eintragen“ neue Kisten.',
    undo: 'Darunter stehen ihre Kisten und Zahlungen. Mit dem Pfeil daneben („Zurücknehmen“) streichst du eine offene Kiste oder eine Zahlung.',
    end: '„Teilnahme beenden“ hältst du gedrückt. Danach kann sie keine Kisten mehr buchen, ihre offenen Kisten bleiben offen.',
  },
  journal: {
    title: 'Alle Buchungen',
    text: 'Darunter steht jede Buchung nach Tagen: Kisten, Zahlungen, Bestand und Teilnahmen. Durchgestrichen heißt: zurückgenommen.',
    filter:
      'Mit den Chips filterst du nach Art. Tippe einen Namen an, um die Person zu öffnen; dort zeigt „Nur … im Journal zeigen“ nur ihre Buchungen.',
  },
  setup: {
    title: 'Einstellungen',
    text: 'Oben unter „Einstellungen“ findest du PayPal, Getränke, Teilnahmen, Code und Übergabe.',
    payPal:
      'Bei „PayPal“ hinterlegst du einen PayPal‑Link. Bar zahlen geht immer, der Link kommt dazu.',
    enrollments: '„Teilnahmen“ zeigt, wer mitmacht und wer aufgehört hat.',
    code: 'Unter „Code“ druckst du den Code für die Palette. Wer ihn scannt, bucht damit Kisten auf sich.',
  },
  drinks: {
    title: 'Getränke',
    text: 'Unter „Getränke“ legst du neue Getränke mit Preis je Kiste an. Tippe ein Getränk an, um Name oder Preis zu ändern.',
    price: 'Ein neuer Preis gilt nur für Kisten, die danach genommen werden.',
    default:
      '„Als Standard“ wählt das Getränk beim Buchen vor. „Getränk auslisten“ geht, sobald keine Kiste mehr da ist.',
  },
  handover: {
    title: 'Übergabe',
    text: 'Gibt der Inhaber die Bierliste ab, wählst du unter „Übergabe“ den neuen Inhaber, seine Preise und optional seinen PayPal‑Link. Dann „Bierliste übergeben“ gedrückt halten.',
    after:
      'Der Bestand geht mit. Offene Kisten bleiben auf der bisherigen Liste und werden weiter an den bisherigen Inhaber bezahlt.',
  },
  pots: {
    title: 'Frühere Listen',
    text: 'Oben unter „Frühere Listen“ stehen die abgeschlossenen Listen. Ist dort noch etwas offen, buchst du die Zahlung direkt in der Liste.',
  },
  openPot: {
    title: 'Bierliste eröffnen',
    text: 'Gerade ist keine Bierliste offen. Wähle den Inhaber, an den das Geld geht, trage die Getränke mit Preis je Kiste ein und optional einen PayPal‑Link.',
    after: '„Bierliste eröffnen“ startet die Liste.',
  },
} as const;
