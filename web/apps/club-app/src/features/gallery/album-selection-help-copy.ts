export const SELECTION_HELP_SPOTS = {
  showcase: 'help-selection-showcase',
} as const;

export const SELECTION_HELP_COPY = {
  add: {
    title: 'Fotos auswählen',
    text: '„Fotos hinzufügen“ zeigt die Fotos des Albums zum Auswählen. Videos und Fotos, die noch nicht fertig sind, kommen nicht in die Auswahl.',
  },
  arrange: {
    title: 'Reihenfolge und Bildunterschrift',
    text: 'Zieh ein Foto am Griff an eine andere Stelle. Unter jedem Foto schreibst du eine Bildunterschrift.',
    cover: 'Das erste Foto ist das Titelbild, solange im Album keins von Hand gewählt ist.',
    remove: 'Mit dem Kreuz nimmst du ein Foto wieder heraus.',
  },
  publish: {
    title: 'Speichern und veröffentlichen',
    text: 'Änderungen sicherst du mit „Auswahl speichern“. Dann halte „Veröffentlichen“ gedrückt – die Fotos erscheinen sofort in der Galerie auf der Website.',
    withdraw: '„Zurückziehen“ nimmt das Album wieder von der Website.',
    session:
      'Ohne Session lässt sich ein Album nicht veröffentlichen. Leg sie unter „Bearbeiten“ im Album fest.',
  },
} as const;
