export const UPLOAD_HELP_SPOTS = {
  pick: 'help-upload-pick',
  status: 'help-upload-status',
} as const;

export const UPLOAD_HELP_COPY = {
  pick: {
    title: 'Bilder wählen',
    text: '„Ordner wählen“ nimmt einen ganzen Ordner, „Dateien wählen“ einzelne Fotos und Videos. Am Computer ziehst du einen Ordner einfach auf die Fläche.',
    formats:
      'Fotos gehen als JPEG, HEIC, PNG oder WebP bis 100 MB, Videos als MP4 oder MOV bis 20 GB.',
  },
  target: {
    title: 'Wohin es geht',
    text: 'Oben steht das Ziel: dein Eingang oder das Album, aus dem du „Hochladen“ geöffnet hast.',
  },
  background: {
    title: 'Hochladen im Hintergrund',
    text: 'Du musst nicht warten: Der Upload läuft weiter, während du in der App woanders bist. Den Stand zeigt die Linie oben in der Galerie.',
    open: 'Lass die App dabei geöffnet. Ohne Netz pausiert der Upload und macht danach an derselben Stelle weiter – auch bei großen Videos.',
  },
  progress: {
    title: 'Fortschritt',
    text: 'Jedes Bild zeigt seinen Stand. Danach bereitet die App es noch auf – „entwickelt“ zählt die fertigen.',
    retry: 'Ein abgebrochenes Bild tippst du an, um es neu zu senden.',
    actions:
      'Oben sendet „Wiederholen“ alle fehlgeschlagenen noch einmal, „Abbrechen“ stoppt die offenen und „Fertige ausblenden“ räumt die Liste auf.',
  },
} as const;
