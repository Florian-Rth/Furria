import type { ManageBankId, ManagePanelId } from './manage-hub-panels';

export const MANAGE_HELP_SPOTS: Record<ManageBankId, string> = {
  belonging: 'help-manage-belonging',
  rights: 'help-manage-rights',
  record: 'help-manage-record',
};

export const MANAGE_HELP_OVERVIEW = {
  title: 'Alles, was du verwalten darfst',
  text: 'Jede Zeile führt in einen Bereich. Du siehst nur die Bereiche, für die du eine Berechtigung hast.',
  status:
    'Rechts steht, was gerade ansteht – etwa offene Anträge oder eine unbesetzte Rolle. „Noch leer“ heißt: Dort ist noch nichts erfasst.',
} as const;

export const MANAGE_HELP_PANELS: Record<ManagePanelId, string> = {
  persons:
    '„Personen & Zugänge“: alle Personen des Vereins, ihre Mitgliedschaft und ihr Zugang zur App.',
  applications: '„Beitrittsanträge“: Anträge von der Website, die du annimmst oder ablehnst.',
  groups: '„Gruppen“: Gruppen und Gruppenarten anlegen, bearbeiten und archivieren.',
  roles: '„Rollen & Rechte“: welche Rolle was in der App darf und wer sie gerade innehat.',
  board: '„Vorstand“: die Vorstandsfunktionen und wer welchen Sitz hat.',
  clubRecord: '„Vereinsdaten“: Name, Anschrift, Mindestalter für die App und die Bühne.',
  sessions: '„Sessionseinträge“: Nummer, Motto und Sessionslogo jeder Session.',
  venues: '„Orte“: Adressen und Öffnungszeiten der Orte, an denen der Verein ist.',
  keys: '„Schlüssel“: wer für welchen Ort einen Schlüssel hat.',
  groupMatcher:
    '„Jeck‑Check“: die Aussagen, mit denen Besucher der Website die passende Gruppe finden.',
};
