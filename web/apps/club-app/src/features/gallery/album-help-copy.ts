export const ALBUM_HELP_SPOTS = {
  scenes: 'help-album-scenes',
  tools: 'help-album-tools',
  shelf: 'help-album-shelf',
} as const;

export const ALBUM_HELP_COPY = {
  view: {
    title: 'Bilder ansehen',
    text: 'Die Bilder sind nach Aufnahmezeit in Szenen geordnet. Tippe ein Bild an, um es groß zu sehen und weiterzublättern.',
    original: 'In der großen Ansicht lädt „Original“ das Bild in voller Größe auf dein Gerät.',
    rail: 'Hat das Album mehrere Szenen, springst du über die Zeitleiste am rechten Rand direkt zu einer Szene.',
  },
  filter: {
    title: 'Filtern',
    text: 'Mit den Filtern oben zeigst du nur Fotos oder nur Videos – oder nur die Bilder eines Fotografen.',
  },
  zip: {
    title: 'Ganzes Album laden',
    text: '„ZIP“ oben lädt alle Originale des Albums in einer Datei herunter. Lass die App dabei geöffnet.',
  },
  upload: {
    title: 'In dieses Album hochladen',
    text: '„Hochladen“ legt neue Fotos und Videos direkt in dieses Album, ohne Umweg über deinen Eingang.',
  },
  select: {
    title: 'Mehrere Bilder auf einmal',
    text: '„Auswählen“ oben oder langes Drücken auf ein Bild startet die Auswahl. Tippe weitere Bilder an oder zieh den Finger über mehrere.',
    done: 'Unten stehen dann die Aktionen. „Fertig“ beendet die Auswahl.',
    curate:
      '„In Auswahl“ und „Aus Auswahl“ nehmen die Fotos in die Auswahl für die Website auf oder heraus.',
    manage:
      '„Verschieben“ legt sie in ein anderes Album. „Löschen“ legt sie in den Papierkorb, dort bleiben sie 30 Tage.',
  },
  shelf: {
    title: 'Auswahl für die Website',
    text: 'Oben stehen die Fotos, die die Website von diesem Album zeigt, sobald es veröffentlicht ist.',
    edit: 'Über „Auswahl bearbeiten“ ordnest du sie, schreibst Bildunterschriften und veröffentlichst.',
  },
  edit: {
    title: 'Album bearbeiten',
    text: '„Bearbeiten“ ändert Titel, Beschreibung, Termin oder Session und Titelbild. Dort löschst du das Album auch.',
  },
} as const;
