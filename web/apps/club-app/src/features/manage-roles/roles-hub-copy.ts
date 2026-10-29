import type { KkIconName } from '@furria/ui/KkIcon';
import type { ClubIcon } from '@/lib/club-icon';
import { toClubIconLabel } from '@/lib/club-icon';
import type { GroupTone } from '@/lib/group-tone';
import { toToneLabel } from '@/lib/group-tone';
import { formatIsoDay, formatPeriod } from '@/lib/membership-labels';
import type { HolderPhase, RightGroupDefinition, RoleFacts } from './roles-hub';
import { isFullSet, OTHER_RIGHTS_GROUP, toOfficeNames } from './roles-hub';
import type { ImpliedByOffice, RolePaneTab, RolesView } from './schemas';

export const ROLES_TITLE = 'Rollen & Rechte';
export const HUB_PATH = '/manage/roles';
export const ROLE_PATH = '/manage/roles/$roleId';
export const EDIT_ROLE_PATH = '/manage/roles/$roleId/edit';
export const NEW_ROLE_PATH = '/manage/roles/new';
export const NEW_ROLE_LABEL = 'Rolle';
export const BOARD_OFFICE_PATH = '/manage/board/$boardOfficeId';
export const LOADING_LABEL = 'Die Rollen werden geladen';
export const RETRY_LABEL = 'Erneut laden';
export const NOT_FOUND_TITLE = 'Diese Rolle gibt es nicht.';
export const NO_ROLES_NOTE = 'Noch keine Rolle.';

export const ARCHIVED_FOLD = 'Archiviert';
export const SHOW_LABEL = 'Zeigen';
export const HIDE_LABEL = 'Ausblenden';
export const ARCHIVED_LIST_ID = 'roles-archived-roles';
export const ROSTER_LABEL = 'Rollen';
export const ARCHIVED_LABEL = 'Archivierte Rollen';
export const OPEN_ROLE_LABEL = 'Öffnen';
export const VIEW_LABEL = 'Ansicht';
export const CLOSE_LABEL = 'Schließen';
export const OPEN_PAGE_LABEL = 'Eigene Seite öffnen';
export const NO_HOLDER_ROLE = 'keine Rolle';

export interface ViewOptionView {
  id: RolesView;
  label: string;
}

export const VIEW_OPTIONS: readonly ViewOptionView[] = [
  { id: 'roles', label: 'Rollen' },
  { id: 'rights', label: 'Rechte' },
];

export const toRightsCount = (count: number): string =>
  count === 1 ? '1 Recht' : `${count} Rechte`;

const NOBODY = 'niemand';

export const NOBODY_LINE = NOBODY;

export const toMoreHolders = (count: number): string => `+ ${count} weitere`;

export const toViaOffices = (offices: readonly ImpliedByOffice[]): string =>
  `über ${toOfficeNames(offices)}`;

export interface RoleFlagView {
  label: string;
  text: string;
}

const toRightsWords = (role: RoleFacts, totalKeys: number): string => {
  const count = role.permissionKeys.length;

  if (count === 0) {
    return 'keine Rechte';
  }

  return isFullSet(role, totalKeys) ? 'alle Rechte' : toRightsCount(count);
};

export const toRightsFlag = (role: RoleFacts, totalKeys: number): RoleFlagView => ({
  label: `${role.permissionKeys.length} von ${totalKeys} Rechten`,
  text: toRightsWords(role, totalKeys),
});

export const toBoardFlag = (role: RoleFacts): RoleFlagView | null => {
  const [first] = role.impliedBy;

  if (first === undefined) {
    return null;
  }

  const further = role.impliedBy.length - 1;
  const text = further > 0 ? `über ${first.name} +${further}` : `über ${first.name}`;

  return { label: `Vorstandsfunktion: ${toOfficeNames(role.impliedBy)}`, text };
};

export const toArchivedSinceLabel = (archivedOn: string): string =>
  `archiviert ${formatIsoDay(archivedOn)}`;

export interface TabView {
  id: RolePaneTab;
  icon: KkIconName;
  label: string;
}

export const TABS: readonly TabView[] = [
  { id: 'rights', icon: 'key', label: 'Rechte' },
  { id: 'holders', icon: 'person', label: 'Inhaber' },
  { id: 'settings', icon: 'settings', label: 'Einstellungen' },
];

export const TABS_LABEL = 'Bereiche der Rolle';
export const CURRENT_TITLE = 'Aktuell';
export const PLANNED_TITLE = 'Geplant';
export const PAST_TITLE = 'Früher';
export const END_HOLDING_LABEL = 'Beenden';
export const ADD_HOLDER_LABEL = 'Inhaberschaft eintragen';
export const EDIT_ROLE_LABEL = 'Bearbeiten';
export const ARCHIVE_LABEL = 'Archivieren';
export const RESTORE_LABEL = 'Aktivieren';
export const ARCHIVED_HOLDERS_NOTE = 'Archiviert. Aktiviere die Rolle, um Inhaber einzutragen.';
export const NO_GRANTED_NOTE = 'Keine Rechte vergeben.';
export const RIGHTS_GUIDANCE = 'Änderungen gelten sofort für alle Inhaber.';
export const HOLDING_ENDED_LABEL = 'beendet';

export const toRightsMeta = (granted: number, total: number): string => `${granted} von ${total}`;

export const toNobodyNote = (offices: readonly ImpliedByOffice[]): string =>
  offices.length === 0 ? 'Niemand eingetragen.' : `Besetzt ${toViaOffices(offices)}.`;

export const toSeatedLabel = (seatedCount: number): string => {
  if (seatedCount === 0) {
    return 'unbesetzt';
  }

  return seatedCount === 1 ? '1 Sitz besetzt' : `${seatedCount} Sitze besetzt`;
};

export const toHolderPeriod = (
  holder: { sinceOn: string; untilOn: string | null },
  phase: HolderPhase,
): string => {
  switch (phase) {
    case 'running':
      return `seit ${formatIsoDay(holder.sinceOn)}`;
    case 'ending':
      return `seit ${formatIsoDay(holder.sinceOn)} · bis ${formatIsoDay(holder.untilOn ?? holder.sinceOn)}`;
    case 'planned':
      return `ab ${formatIsoDay(holder.sinceOn)}`;
    case 'past':
      return formatPeriod(holder.sinceOn, holder.untilOn);
  }
};

export const DESCRIPTION_LABEL = 'Beschreibung';
export const COIN_LABEL = 'Abzeichen';
export const BOARD_TITLE = 'Vorstandsfunktionen';

const COIN_NONE = 'keins';

export const toCoinLine = (coin: { icon: ClubIcon; tone: GroupTone } | null): string =>
  coin === null ? COIN_NONE : `${toClubIconLabel(coin.icon)}, ${toToneLabel(coin.tone)}`;

export const OPEN_HOLDING_TITLE = 'Inhaberschaft eintragen';
export const END_HOLDING_TITLE = 'Inhaberschaft beenden';
export const PICKER_NOTE = 'Auch ohne Mitgliedschaft möglich.';
export const SINCE_LABEL = 'Inne ab';
export const SINCE_HINT =
  'Die Rechte gelten ab diesem Tag. Auch ein Datum in der Zukunft ist möglich.';
export const END_LABEL = 'Letzter Tag';
export const END_HINT = 'Dieser Tag zählt noch dazu.';
export const SUBMIT_OPEN = 'Eintragen';
export const SUBMIT_END = 'Beenden';

export const RIGHT_GROUP_DEFINITIONS: readonly RightGroupDefinition[] = [
  {
    id: 'people',
    keys: [
      'persons.read_details',
      'persons.manage',
      'persons.delete',
      'accounts.manage',
      'membership_applications.decide',
    ],
  },
  {
    id: 'club',
    keys: [
      'groups.manage',
      'roles.manage',
      'board.manage',
      'club.read',
      'club.manage',
      'key_holdings.manage',
      'announcements.post',
      'calendar.manage_club',
    ],
  },
  { id: 'events', keys: ['events.manage'] },
  {
    id: 'media',
    keys: ['gallery.upload', 'gallery.manage', 'gallery.publish', 'news.manage'],
  },
  { id: 'system', keys: ['system.view'] },
];

const RIGHT_GROUP_TITLES: Record<string, string> = {
  people: 'Personen und Zugang',
  club: 'Verein',
  events: 'Veranstaltungen',
  media: 'Galerie und Aktuelles',
  system: 'System',
  [OTHER_RIGHTS_GROUP]: 'Weitere',
};

export const toRightGroupTitle = (id: string): string => RIGHT_GROUP_TITLES[id] ?? id;
