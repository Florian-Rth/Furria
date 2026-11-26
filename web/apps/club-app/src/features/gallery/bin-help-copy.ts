export const BIN_HELP_SPOTS = {
  albums: 'help-bin-albums',
  items: 'help-bin-items',
} as const;

export const BIN_HELP_COPY = {
  albums: {
    title: 'Gelöschte Alben',
    text: 'Ein gelöschtes Album wartet hier mit allen Bildern. „Wiederherstellen“ holt es zurück.',
  },
  items: {
    title: 'Einzelne Bilder',
    text: 'Aus Alben gelöschte Bilder stehen nach Album geordnet. Tippe die Bilder an, die du zurückhaben willst, dann unten auf „Bilder wiederherstellen“.',
    back: 'Sie kommen zurück in ihr Album.',
  },
  countdown: {
    title: 'Wie lange noch',
    text: 'Alles bleibt 30 Tage im Papierkorb. Die Zahl am Bild zeigt die Tage, bis es endgültig gelöscht ist.',
    inbox: 'Was im Eingang verworfen wird, kommt nicht hierher – es ist sofort gelöscht.',
  },
} as const;
