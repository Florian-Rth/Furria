export const WEBSITE_HELP_SPOTS = {
  slots: 'help-website-slots',
  orphans: 'help-website-orphans',
} as const;

export const WEBSITE_HELP_COPY = {
  slots: {
    title: 'Bildplätze',
    text: 'Jede Zeile ist ein fester Platz für ein Foto auf der Website, nach Seiten geordnet. Die kleine Skizze zeigt, wo er sitzt, daneben stehen Format und Beschreibung.',
  },
  fill: {
    title: 'Foto setzen',
    text: 'Tippe einen Platz an. „Hochladen“ nimmt ein neues Foto, „Aus der Galerie“ eines aus einem Album, „Gleiches Foto wie …“ das eines anderen Platzes.',
    copy: 'Ein Foto aus der Galerie wird kopiert. Wird es im Album gelöscht, bleibt es trotzdem auf der Website.',
  },
  crop: {
    title: 'Zuschneiden',
    text: '„Zuschneiden“ legt den Ausschnitt fest. Ändert sich das Format auf der Website, steht am Platz „Zuschnitt passt nicht mehr“ – dann hilft „Neu zuschneiden“.',
  },
  alt: {
    title: 'Bildbeschreibung',
    text: 'Fast jedes Foto braucht einen Satz, der beschreibt, was darauf zu sehen ist – für alle, die das Bild nicht sehen. Fehlt er, steht am Platz „Beschreibung fehlt“.',
  },
  live: {
    title: 'Sofort sichtbar',
    text: 'Jede Änderung steht sofort auf der Website. „Entfernen“ löscht das Foto ohne Papierkorb.',
  },
  orphans: {
    title: 'Nicht mehr auf der Website',
    text: 'Plätze, die die Website nicht mehr nutzt, stehen ganz unten. Ihr Foto legst du mit „Übertragen“ auf einen freien Platz im gleichen Format oder entfernst es.',
  },
} as const;
