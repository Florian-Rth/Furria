export const GROUPS_HELP_SPOTS = {
  filters: 'help-groups-filters',
  register: 'help-groups-register',
  kinds: 'help-groups-kinds',
  createForm: 'help-group-create-form',
  kind: 'help-group-kind',
  kindForm: 'help-group-kind-form',
} as const;

export const GROUPS_HELP_COPY = {
  register: {
    title: 'Alle Gruppen',
    text: 'Im Verzeichnis steht jede Gruppe mit ihren Gruppen‑Admins und wie viele Personen dabei sind. Tippe eine Gruppe an, um ihre Seite zu öffnen – dort pflegst du Personen, Gruppen‑Admins und Einstellungen.',
    flags:
      'Hinweise wie „Ohne Gruppen‑Admin“, „Ohne Gruppenart“ oder „Niemand dabei“ zeigen, wo noch etwas fehlt.',
  },
  filters: {
    title: 'Suchen und filtern',
    text: 'Mit der Lupe oben suchst du nach dem Namen. Fehlt bei einer Gruppe etwas, erscheinen oben Filter wie „ohne Gruppenart“ – sie zeigen nur die betroffenen Gruppen.',
  },
  add: {
    title: 'Neue Gruppe',
    text: 'Mit „+ Gruppe“ im Verzeichnis legst du eine Gruppe an. Personen und Gruppen‑Admins trägst du danach auf ihrer Seite ein.',
  },
  archive: {
    title: 'Archivieren und zurückholen',
    text: 'Eine Gruppe archivierst du auf ihrer Seite über das Zahnrad. Sie verschwindet aus dem Verzeichnis der App und zählt nicht mehr dafür, ob jemand im Verein aktiv ist. Die Zugehörigkeiten bleiben erhalten.',
    restore:
      'Archivierte Gruppen stehen ganz unten. Mit „Zurückholen“ ist eine Gruppe wieder aktiv.',
  },
  kinds: {
    title: 'Gruppenarten',
    text: 'Die Gruppenart sagt, was eine Gruppe ist – etwa Tanzgarde, Showtanz oder Organisation. Jeder Gruppe ordnest du eine zu.',
    add: 'Mit „+ Gruppenart“ legst du eine neue an. Tippe eine Karte an, um sie umzubenennen oder zu archivieren.',
  },
  createForm: {
    title: 'Name, Gruppenart und Symbol',
    text: 'Gib der Gruppe einen Namen und wähle ihre Gruppenart. Das Symbol ist freiwillig.',
    after:
      'Mit „Hinzufügen“ ist die Gruppe angelegt und du landest wieder im Verzeichnis. Öffne sie dort, um Personen und Gruppen‑Admins einzutragen.',
  },
  kind: {
    title: 'Diese Gruppenart',
    text: 'Hier siehst du den Namen und wie viele Gruppen diese Art haben. Über „Bearbeiten“ änderst du den Namen – er ändert sich für alle Gruppen dieser Art.',
  },
  kindArchive: {
    title: 'Archivieren',
    text: 'Archivieren geht nur, wenn keiner Gruppe diese Art mehr zugeordnet ist. Danach lässt sie sich keiner Gruppe mehr zuordnen.',
    restore: 'In der Gruppenverwaltung holst du sie mit „Zurückholen“ wieder.',
  },
  kindForm: {
    title: 'Name der Gruppenart',
    text: 'Der Name steht bei jeder Gruppe dieser Art – in der App und auf der Website.',
  },
  kindSave: {
    create: 'Mit „Hinzufügen“ steht die neue Gruppenart sofort zur Auswahl.',
    edit: 'Mit „Speichern“ gilt der neue Name sofort für alle Gruppen dieser Art.',
  },
} as const;
