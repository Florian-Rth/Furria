import type { KkConfirmFact } from '@furria/ui';
import type { PersonRef } from '@/lib/api/schemas';
import {
  GROUP_SECTION_TITLES as SHARED_GROUP_SECTION_TITLES,
  toGroupMembersLabel,
} from '@/lib/group-sections';
import { formatIsoDay } from '@/lib/membership-labels';
import type { StateChip } from '@/lib/state-chips';
import { ARCHIVED_CHIP, toRecruitingChip } from '@/lib/state-chips';
import { isGroupArchived } from './manage-groups-work';
import type { ManagedGroupKind, ManagedGroupSummary } from './schemas';

export const MANAGE_GROUPS_SECTION_TITLES = {
  members: SHARED_GROUP_SECTION_TITLES.managedMembers,
} as const;

export interface ManagedGroupsEmptyCopy {
  title: string;
  description: string;
}

export const MANAGED_GROUPS_EMPTY: Record<'filtered' | 'cold', ManagedGroupsEmptyCopy> = {
  filtered: {
    title: 'KEINE GRUPPE PASST',
    description: 'Anderer Suchbegriff oder ein anderer Filter bringt sie zurück.',
  },
  cold: {
    title: 'NOCH KEINE GRUPPE',
    description:
      'Leg die erste Gruppe an. Danach kannst du Personen dazu eintragen und Gruppen-Admins ernennen.',
  },
};

export const REGISTER_TITLE = 'Verzeichnis';

export const MANAGE_GROUPS_FOOTNOTE =
  'Archivieren löscht nichts: Die Gruppe verschwindet aus dem Verzeichnis, ihre Geschichte bleibt in den Profilen stehen.';

export const APPOINT_ADMIN_LABEL = 'Admin ernennen';

export const toAppointAdminActionLabel = (name: string): string =>
  `Gruppen-Admin für ${name} ernennen`;

export const toManagedGroupStatusChip = (group: ManagedGroupSummary): StateChip | null => {
  if (isGroupArchived(group)) {
    return ARCHIVED_CHIP;
  }
  if (group.isRecruiting) {
    return toRecruitingChip(true);
  }

  return null;
};

export const toGroupSizeLine = toGroupMembersLabel;

const toPersonName = (person: PersonRef): string => `${person.firstName} ${person.lastName}`;

export const toGroupAdminsLine = (admins: readonly PersonRef[]): string | null => {
  const [first] = admins;

  if (first === undefined) {
    return null;
  }
  if (admins.length === 1) {
    return toPersonName(first);
  }

  const further = admins.length - 1;

  if (further === 1) {
    return `${toPersonName(first)} und 1 weitere Person`;
  }

  return `${toPersonName(first)} und ${further} weitere Personen`;
};

export const findManagedGroup = (
  groups: readonly ManagedGroupSummary[],
  groupId: number | null,
): ManagedGroupSummary | null => {
  if (groupId === null) {
    return null;
  }

  return groups.find((group) => group.groupId === groupId) ?? null;
};

const NOBODY_LINE = 'Es ist gerade niemand eingetragen.';

const toZugehoerigkeitenClause = (
  count: number,
  singularVerb: string,
  pluralVerb: string,
): string => {
  if (count === 0) {
    return NOBODY_LINE;
  }
  if (count === 1) {
    return `Die eine Zugehörigkeit ${singularVerb}.`;
  }

  return `Die ${count} Zugehörigkeiten ${pluralVerb}.`;
};

export const toArchivedSinceLine = (archivedOn: string): string =>
  `Archiviert am ${formatIsoDay(archivedOn)}. Zum Bearbeiten musst du die Gruppe zuerst zurückholen.`;

export const toArchiveQuestion = (name: string): string => `${name} archivieren?`;

export const ARCHIVE_EYEBROW = 'Gruppe archivieren';
export const ARCHIVE_EXPLANATION =
  'Archivieren löscht nichts: Die Zugehörigkeiten bleiben bestehen — die Gruppe zählt nur nicht mehr mit. Sie verschwindet aus dem Verzeichnis, ihre Geschichte bleibt in den Profilen stehen.';

export const toArchiveConsequence = (
  name: string,
  memberCount: number,
  todayLabel: string,
): string =>
  `Ab dem ${todayLabel} steht ${name} nicht mehr im Verzeichnis. ${toZugehoerigkeitenClause(memberCount, 'bleibt bestehen', 'bleiben bestehen')}`;

export const toRestoreQuestion = (name: string): string => `${name} wieder aktivieren?`;

export const RESTORE_EYEBROW = 'Gruppe aktivieren';
export const RESTORE_EXPLANATION =
  'Die Gruppe steht wieder im Verzeichnis und zählt wieder für die Vereinsbindung. An den Zeiträumen ändert sich nichts — sie waren nie weg.';

export const toRestoreConsequence = (
  name: string,
  memberCount: number,
  todayLabel: string,
): string =>
  `Ab dem ${todayLabel} steht ${name} wieder im Verzeichnis. ${toZugehoerigkeitenClause(memberCount, 'zählt wieder mit', 'zählen wieder mit')}`;

export const toGroupFacts = (group: ManagedGroupSummary, dayLabel: string): KkConfirmFact[] => [
  { label: 'Gruppe', value: group.name },
  { label: 'Personen', value: String(group.memberCount) },
  { label: 'Gruppen-Admins', value: String(group.admins.length) },
  { label: 'Ab', value: dayLabel },
];

export const toGroupCreatedMessage = (name: string): string => `${name} ist angelegt.`;

export const toGroupSavedMessage = (name: string): string => `${name} ist gespeichert.`;

export const toGroupArchivedMessage = (name: string): string => `${name} ist archiviert.`;

export const toGroupRestoredMessage = (name: string): string => `${name} ist wieder aktiv.`;

export const GROUP_KINDS_PANEL_TITLE = 'Gruppenarten';

export const CREATE_GROUP_KIND_LABEL = 'Gruppenart anlegen';

export const GROUP_KINDS_EMPTY_TITLE = 'NOCH KEINE GRUPPENART';

export const GROUP_KINDS_EMPTY_DESCRIPTION =
  'Leg die erste Gruppenart an. Danach kannst du jeder Gruppe eine zuordnen.';

export const toArchiveGroupKindBlockedHint = (groupCount: number): string =>
  groupCount === 1 ? '1 Gruppe trägt diese Art' : `${groupCount} Gruppen tragen diese Art`;

export interface GroupKindEntry {
  groupKindId: number;
  name: string;
  sortOrder: number;
  archivedOn: string | null;
  isArchived: boolean;
  groupCount: number;
}

const toGroupKindEntry = (kind: ManagedGroupKind): GroupKindEntry => ({
  groupKindId: kind.groupKindId,
  name: kind.name,
  sortOrder: kind.sortOrder,
  archivedOn: kind.archivedOn,
  isArchived: kind.archivedOn !== null,
  groupCount: kind.groupCount,
});

const inBandOrder = (left: GroupKindEntry, right: GroupKindEntry): number => {
  if (left.isArchived !== right.isArchived) {
    return left.isArchived ? 1 : -1;
  }
  if (left.sortOrder !== right.sortOrder) {
    return left.sortOrder - right.sortOrder;
  }

  return left.name.localeCompare(right.name, 'de');
};

export const toGroupKindEntries = (kinds: readonly ManagedGroupKind[]): GroupKindEntry[] =>
  kinds.map(toGroupKindEntry).sort(inBandOrder);

export const isGroupKindArchivable = (entry: GroupKindEntry): boolean =>
  !entry.isArchived && entry.groupCount === 0;

export const toArchivedGroupKindMeta = (archivedOn: string | null): string | undefined =>
  archivedOn === null ? undefined : `Archiviert am ${formatIsoDay(archivedOn)}`;

export const toGroupKindUsageLine = (groupCount: number): string => {
  if (groupCount === 0) {
    return 'keine Gruppe';
  }
  if (groupCount === 1) {
    return '1 Gruppe';
  }

  return `${groupCount} Gruppen`;
};

export const toGroupKindsIntro = (entries: readonly GroupKindEntry[]): string => {
  if (entries.length === 0) {
    return 'Noch ist keine Gruppenart festgehalten.';
  }

  const archived = entries.filter((entry) => entry.isArchived).length;
  const live = entries.length - archived;
  const head =
    live === 1 ? 'Eine Gruppenart ist festgehalten.' : `${live} Gruppenarten sind festgehalten.`;

  if (archived === 0) {
    return head;
  }

  const tail =
    archived === 1 ? 'Eine weitere ist archiviert.' : `${archived} weitere sind archiviert.`;

  return `${head} ${tail}`;
};

export const toGroupKindFacts = (entry: GroupKindEntry, dayLabel: string): KkConfirmFact[] => [
  { label: 'Gruppenart', value: entry.name },
  { label: 'Platz in der Liste', value: String(entry.sortOrder) },
  { label: 'Gruppen', value: String(entry.groupCount) },
  { label: 'Ab', value: dayLabel },
];

export const ARCHIVE_GROUP_KIND_EYEBROW = 'Gruppenart archivieren';

export const toArchiveGroupKindQuestion = (name: string): string => `${name} archivieren?`;

export const ARCHIVE_GROUP_KIND_EXPLANATION =
  'Archivieren löscht nichts: Die Gruppenart verschwindet aus der Auswahl und lässt sich keiner Gruppe mehr zuordnen. Zurückholen kannst du sie jederzeit.';

export const toArchiveGroupKindConsequence = (name: string, dayLabel: string): string =>
  `Ab dem ${dayLabel} steht ${name} nicht mehr zur Auswahl. An den Gruppen ändert sich nichts.`;

export const RESTORE_GROUP_KIND_EYEBROW = 'Gruppenart aktivieren';

export const toRestoreGroupKindQuestion = (name: string): string => `${name} wieder aktivieren?`;

export const RESTORE_GROUP_KIND_EXPLANATION =
  'Die Gruppenart steht wieder zur Auswahl und lässt sich wieder zuordnen. An den Gruppen, die sie schon tragen, ändert sich nichts — sie war nie weg.';

export const toRestoreGroupKindConsequence = (name: string, dayLabel: string): string =>
  `Ab dem ${dayLabel} steht ${name} wieder zur Auswahl.`;

export const toGroupKindCreatedMessage = (name: string): string =>
  `Die Gruppenart ${name} ist angelegt.`;

export const toGroupKindSavedMessage = (name: string): string =>
  `Die Angaben zu ${name} sind gespeichert.`;

export const toGroupKindArchivedMessage = (name: string): string => `${name} ist archiviert.`;

export const toGroupKindRestoredMessage = (name: string): string =>
  `${name} steht wieder zur Auswahl.`;
