export const GALLERY_HUB_HELP_SPOTS = {
  albums: 'help-gallery-albums',
  inbox: 'help-gallery-inbox',
  links: 'help-gallery-links',
  website: 'help-gallery-website',
} as const;

export const GALLERY_HUB_HELP_COPY = {
  albums: {
    title: 'Alben ansehen',
    text: 'Die Alben stehen nach Session geordnet, Alben ohne Session unter „Ohne Session“. Tippe ein Album an, um alle Fotos und Videos zu sehen.',
    fresh: '„Neu“ steht an Alben, die in den letzten 14 Tagen angelegt wurden.',
    published: '„Veröffentlicht“ heißt: Die Auswahl des Albums ist auf der Website zu sehen.',
    selection: '„Auswahl 12“ zeigt, wie viele Fotos schon für die Website ausgewählt sind.',
  },
  upload: {
    title: 'Fotos und Videos hochladen',
    text: 'Über „Hochladen“ oben rechts lädst du Bilder vom Handy oder Computer hoch. Sie landen zuerst in deinem Eingang.',
    newAlbum:
      '„Neues Album“ legt ein Album an, zum Beispiel für einen Termin, bevor du die Bilder einsortierst.',
  },
  inbox: {
    title: 'Dein Eingang',
    text: 'Was du hochgeladen, aber noch keinem Album zugeordnet hast, liegt in deinem Eingang. Außer dir sieht es nur, wer die Galerie führt.',
    open: 'Tippe einen Eingang an, um die Bilder zu sichten und in Alben abzulegen.',
    manage: 'Du siehst hier die Eingänge aller, die hochladen.',
  },
  links: {
    title: 'Sammellinks',
    text: 'Über „Sammellinks“ erstellst du einen Link, mit dem auch Gäste ohne App ihre Fotos und Videos hochladen.',
  },
  bin: {
    title: 'Papierkorb',
    text: '„Papierkorb“ oben rechts zeigt gelöschte Alben und Bilder. 30 Tage lang holst du sie dort zurück.',
  },
  website: {
    title: 'Bilder der Website',
    text: 'Unter „Website“ legst du fest, welche Fotos an den festen Plätzen der Website stehen, etwa das Titelbild der Startseite.',
  },
} as const;
