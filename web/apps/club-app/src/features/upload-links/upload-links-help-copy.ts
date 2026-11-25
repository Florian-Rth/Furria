export const UPLOAD_LINKS_HELP_SPOTS = {
  create: 'help-links-create',
  open: 'help-links-open',
} as const;

export const UPLOAD_LINKS_HELP_COPY = {
  create: {
    title: 'Sammellink erstellen',
    text: 'Gib den Anlass ein, etwa „Rosenmontagszug 2027“, und tippe „Link erstellen“. Teile den Link dann in die Gruppe.',
  },
  guests: {
    title: 'Wer damit hochlädt',
    text: 'Jeder mit dem Link kann 7 Tage lang Fotos und Videos hochladen – auch ohne Zugang zur App. Dabei sieht er nur, was er selbst schickt.',
  },
  inbox: {
    title: 'Was ankommt',
    text: 'Alles landet im eigenen Eingang des Links. Den sieht nur, wer die Galerie führt. In der Galerie steht ein Bild erst, wenn ihr es in ein Album legt.',
  },
  manage: {
    title: 'Einen Link verwalten',
    text: 'Tippe einen Link an: „Eingang sortieren“ öffnet seine Bilder, „Teilen“ oder „Link kopieren“ gibt ihn noch einmal weiter.',
    end: '„Beenden“ schließt ihn sofort. Laufende Uploads brechen dann ab, was angekommen ist, bleibt.',
    ended: 'Abgelaufene und beendete Links stehen darunter.',
  },
} as const;
