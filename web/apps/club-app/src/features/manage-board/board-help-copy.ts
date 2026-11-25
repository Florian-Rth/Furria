export const BOARD_HELP_SPOTS = {
  strip: 'help-board-strip',
  open: 'help-board-open',
  held: 'help-board-held',
  office: 'help-board-office',
  role: 'help-board-role',
} as const;

export const BOARD_HELP_ROLE_CHIP = 'Rollen & Rechte';

export const BOARD_HELP_COPY = {
  strip: {
    title: 'Wie der Vorstand gerade steht',
    text: 'Der Ring zeigt, wie viele Vorstandsfunktionen besetzt sind. Die Zähler daneben filtern die Liste – noch einmal tippen zeigt wieder alles.',
    next: 'Darunter steht die nächste geplante Änderung, etwa wer bald beginnt oder aufhört.',
  },
  open: {
    title: 'Was zu tun ist',
    text: 'Unter „Offen“ stehen unbesetzte Funktionen, Sitze, die enden, ohne dass jemand nachfolgt, und geplante Wechsel.',
    action:
      'Mit „Sitz eintragen“ oder „Nachfolge eintragen“ wählst du eine Person und den ersten Tag im Vorstand.',
    role: 'Ist eine Funktion mit einer Rolle verknüpft, darfst du sie nur besetzen, wenn du auch Rollen & Rechte verwalten darfst – der Sitz gibt die Rechte dieser Rolle weiter.',
  },
  held: {
    title: 'Wer im Vorstand sitzt',
    text: 'Unter „Besetzt“ stehen die Funktionen mit ihren Inhabern. Tippe eine Zeile an, um die Funktion zu öffnen.',
    archived:
      'Archivierte Funktionen liegen eingeklappt ganz unten. Mit „Zeigen“ klappst du sie auf.',
  },
  add: {
    title: 'Neue Funktion',
    text: 'Mit „+ Funktion“ oben legst du eine Vorstandsfunktion an, etwa Präsident oder Kassenwart.',
  },
  seats: {
    title: 'Besetzung und Verlauf',
    text: 'Unter „Besetzung“ siehst du, wer die Funktion gerade innehat und wer schon geplant ist. Mit „Beenden“ trägst du den letzten Tag eines Sitzes ein.',
    history:
      'Unter „Verlauf“ steht, wer die Funktion früher hatte – beendete Sitze bleiben erhalten.',
    seat: 'Unten trägst du mit „Sitz eintragen“ oder „Nachfolge eintragen“ eine Person ein.',
  },
  settings: {
    title: 'Website und Rolle',
    text: 'Unter „Einstellungen“ schaltest du „Auf der Website zeigen“ ein: Dann steht, wer die Funktion innehat, mit Name und Porträt auf der Vereinswebsite.',
    role: 'Die verknüpfte Rolle bekommt jede Person, solange ihr Sitz läuft. Endet der Sitz, entfallen die Rechte.',
    edit: 'Name, Platz im Vorstand, Symbol und Rolle änderst du über „Bearbeiten“.',
  },
  archive: {
    title: 'Archivieren',
    text: 'Archivieren geht erst, wenn kein Sitz mehr läuft. Danach lässt sich die Funktion nicht mehr besetzen, ihr Verlauf bleibt aber erhalten.',
    restore: 'Mit „Aktivieren“ holst du eine archivierte Funktion zurück.',
  },
  editorOffice: {
    title: 'Name und Platz',
    text: 'Der Name steht so im Vorstand und – wenn die Funktion auf der Website gezeigt wird – auch dort.',
    order:
      '„Platz im Vorstand“ legt die Reihenfolge fest: Kleinere Zahlen stehen weiter oben. Das Symbol ist freiwillig.',
  },
  editorRole: {
    title: 'Verknüpfte Rolle',
    text: 'Wer einen Sitz in dieser Funktion hat, bekommt die Rechte der gewählten Rolle, solange der Sitz läuft. Mit „keine Rolle“ gibt die Funktion keine Rechte weiter.',
    readOnly:
      'Ändern kann die Rolle nur, wer auch Rollen & Rechte verwalten darf – sonst siehst du sie nur.',
  },
  editorCreate: {
    title: 'Danach',
    text: 'Mit „Hinzufügen“ ist die Funktion angelegt. Die Rolle verknüpfst du anschließend über „Bearbeiten“, die Sitze trägst du im Vorstand ein.',
  },
  editorSave: {
    title: 'Speichern',
    text: 'Mit „Speichern“ gelten die Änderungen sofort, auch für laufende Sitze.',
  },
} as const;
