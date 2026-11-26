export const ROLES_HELP_SPOTS = {
  view: 'help-roles-view',
  coreSection: 'help-role-core',
  coinSection: 'help-role-coin',
} as const;

export const ROLES_HELP_COPY = {
  view: {
    title: 'Rollen oder Rechte',
    text: 'Oben wechselst du die Ansicht: „Rollen“ zeigt jede Rolle mit ihren Rechten und Inhabern, „Rechte“ zeigt jedes Recht und welche Rollen es haben.',
    rights: 'Tippe in der Rechte‑Ansicht eine Rolle an, um sie zu öffnen.',
  },
  list: {
    title: 'Eine Rolle öffnen',
    text: 'Tippe eine Rolle an. Sie öffnet sich mit drei Bereichen: „Rechte“, „Inhaber“ und „Einstellungen“.',
    archived: 'Archivierte Rollen liegen eingeklappt ganz unten. Mit „Zeigen“ klappst du sie auf.',
  },
  rights: {
    title: 'Was die Rolle darf',
    text: 'Unter „Rechte“ schaltest du einzelne Rechte ein oder aus. Jede Änderung gilt sofort für alle, die die Rolle gerade innehaben.',
    roles:
      'Vorsicht mit „Rollen und Rechte verwalten“: Wer das darf, kann sich jedes andere Recht selbst geben. Bevor du es vergibst, fragt die App nach.',
    self: 'Nimmst du dir ein Recht selbst weg, fragt die App vorher nach – danach kommst du womöglich nicht mehr auf diese Seite.',
  },
  holders: {
    title: 'Wer die Rolle innehat',
    text: 'Unter „Inhaber“ trägst du mit „Inhaberschaft eintragen“ eine Person und ihren ersten Tag ein. Mit „Beenden“ setzt du den letzten Tag, mit „Ändern“ korrigierst du die Daten.',
    history: 'Beendete Inhaberschaften bleiben unter „Früher“ erhalten.',
    board:
      'Ist die Rolle mit einer Vorstandsfunktion verknüpft, hat sie auch jede Person mit einem laufenden Sitz in dieser Funktion – das trägst du unter „Vorstand“ ein, nicht hier.',
  },
  settings: {
    title: 'Beschreibung und Abzeichen',
    text: 'Unter „Einstellungen“ stehen Beschreibung und Abzeichen. Über „Bearbeiten“ änderst du sie.',
    coin: 'Ist das Abzeichen an, tragen alle Inhaber es an ihrem Profilbild.',
  },
  archive: {
    title: 'Archivieren',
    text: 'Archivieren nimmt allen Inhabern ab heute die Rechte der Rolle und nimmt sie aus der Auswahl. Mit „Aktivieren“ gelten die Rechte wieder.',
  },
  add: {
    title: 'Neue Rolle',
    text: 'Mit „+ Rolle“ oben legst du eine Rolle an. Danach gibst du ihr Rechte und trägst Inhaber ein.',
  },
  editorCore: {
    title: 'Name und Beschreibung',
    text: 'Der Name steht überall, wo die Rolle vorkommt. In der Beschreibung hältst du fest, wofür die Rolle da ist.',
  },
  editorCoin: {
    title: 'Abzeichen am Profilbild',
    text: 'Schaltest du das Abzeichen ein, wählst du Symbol und Farbe. Es erscheint am Profilbild aller, die die Rolle innehaben.',
  },
  editorCreate: {
    title: 'Danach',
    text: 'Mit „Hinzufügen“ ist die Rolle angelegt – noch ohne Rechte und Inhaber. Beides trägst du anschließend in der Rolle ein.',
  },
  editorSave: {
    title: 'Speichern',
    text: 'Mit „Speichern“ gelten Name, Beschreibung und Abzeichen sofort. Rechte und Inhaber änderst du in der Rolle selbst.',
  },
} as const;
