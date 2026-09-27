import type { KkIconName } from '@furria/ui';

export type ManagePanelId =
  | 'persons'
  | 'groups'
  | 'roles'
  | 'board'
  | 'clubRecord'
  | 'sessions'
  | 'venues'
  | 'keys';

export type ManageBankId = 'belonging' | 'rights' | 'record';

export interface ManagePanelDefinition {
  id: ManagePanelId;
  bank: ManageBankId;
  title: string;
  icon: KkIconName;
  to: string;
}

export interface ManageBankDefinition {
  id: ManageBankId;
  title: string;
}

export const MANAGE_BANKS: readonly ManageBankDefinition[] = [
  { id: 'belonging', title: 'Wer dazugehört' },
  { id: 'rights', title: 'Wer darf was' },
  { id: 'record', title: 'Vereinsdaten' },
];

export const MANAGE_PANELS: readonly ManagePanelDefinition[] = [
  {
    id: 'persons',
    bank: 'belonging',
    title: 'Personen & Mitgliedschaften',
    icon: 'person',
    to: '/manage/persons',
  },
  { id: 'groups', bank: 'belonging', title: 'Gruppen', icon: 'group', to: '/manage/groups' },
  {
    id: 'roles',
    bank: 'rights',
    title: 'Rollen & Rechte',
    icon: 'permissions',
    to: '/manage/roles',
  },
  { id: 'board', bank: 'rights', title: 'Vorstand', icon: 'board', to: '/manage/board' },
  {
    id: 'clubRecord',
    bank: 'record',
    title: 'Vereinsdaten',
    icon: 'club',
    to: '/manage/club-record',
  },
  {
    id: 'sessions',
    bank: 'record',
    title: 'Sessionseinträge',
    icon: 'session',
    to: '/manage/sessions',
  },
  { id: 'venues', bank: 'record', title: 'Orte', icon: 'place', to: '/manage/venues' },
  { id: 'keys', bank: 'record', title: 'Schlüssel', icon: 'key', to: '/manage/keys' },
];
