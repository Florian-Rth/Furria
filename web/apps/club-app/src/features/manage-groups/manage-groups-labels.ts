import type { KkChipTone, KkConfirmFact, KkScreenOrigin } from '@furria/ui';
import { toGroupKindLabel } from '@/features/groups';
import type { PersonRef } from '@/lib/api/schemas';
import { toGroupMembersLabel } from '@/lib/group-sections';
import { formatIsoDay } from '@/lib/membership-labels';
import type { ManagedGroupKind, ManagedGroupSummary } from './schemas';

const MANAGE_GROUPS_PATH = '/manage/groups';
const GROUP_KIND_ID_PATTERN = /^[1-9]\d*$/;

export const MANAGE_GROUPS_TITLE = 'Gruppenverwaltung';

export const MANAGE_GROUPS_ORIGIN: KkScreenOrigin = {
  label: MANAGE_GROUPS_TITLE,
  to: MANAGE_GROUPS_PATH,
};

export const toGroupKindEntryId = (raw: string): number | null =>
  GROUP_KIND_ID_PATTERN.test(raw) ? Number(raw) : null;

export interface ManagedGroupsEmptyCopy {
  title: string;
  description: string;
}

export const MANAGED_GROUPS_EMPTY: Record<'filtered' | 'cold', ManagedGroupsEmptyCopy> = {
  filtered: {
    title: 'KEINE GRUPPE PASST',
    description: 'Passe Suche oder Filter an.',
  },
  cold: {
    title: 'NOCH KEINE GRUPPE',
    description: 'Lege die erste Gruppe an.',
  },
};

export const REGISTER_TITLE = 'Verzeichnis';

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

export const toGroupFactsLine = (group: ManagedGroupSummary): string | null => {
  const parts: string[] = [];
  const admins = toGroupAdminsLine(group.admins);

  if (admins !== null) {
    parts.push(admins);
  }
  if (group.memberCount > 0) {
    parts.push(toGroupSizeLine(group.memberCount));
  }
  if (parts.length === 0) {
    return null;
  }

  return parts.join(' \u00b7 ');
};

export interface GroupRegisterFlag {
  id: string;
  label: string;
  tone: KkChipTone;
  dot: boolean;
}

const NO_ADMIN_FLAG = 'Ohne Gruppen-Admin';
const NO_KIND_FLAG = 'Ohne Gruppenart';
const NO_PEOPLE_FLAG = 'Niemand dabei';

export const toArchivedOnLabel = (archivedOn: string): string =>
  `Archiviert am ${formatIsoDay(archivedOn)}`;

export const toGroupRegisterFlags = (group: ManagedGroupSummary): GroupRegisterFlag[] => {
  if (group.archivedOn !== null) {
    return [
      { id: 'archived', label: toArchivedOnLabel(group.archivedOn), tone: 'neutral', dot: false },
    ];
  }

  const flags: GroupRegisterFlag[] = [];

  if (group.admins.length === 0) {
    flags.push({ id: 'no-admin', label: NO_ADMIN_FLAG, tone: 'accent', dot: true });
  }
  if (group.groupKindId === null) {
    flags.push({ id: 'no-kind', label: NO_KIND_FLAG, tone: 'gold', dot: true });
  }
  if (group.memberCount === 0) {
    flags.push({ id: 'no-people', label: NO_PEOPLE_FLAG, tone: 'gold', dot: true });
  }

  const kindLabel = toGroupKindLabel(group.groupKindName);

  if (kindLabel !== null) {
    flags.push({ id: 'kind', label: kindLabel, tone: 'neutral', dot: false });
  }

  return flags;
};

const NOBODY_LINE = 'Es ist niemand eingetragen.';

const toZugehoerigkeitenClause = (
  count: number,
  singularVerb: string,
  pluralVerb: string,
): string => {
  if (count === 0) {
    return NOBODY_LINE;
  }
  if (count === 1) {
    return `1 Zugehörigkeit ${singularVerb}.`;
  }

  return `${count} Zugehörigkeiten ${pluralVerb}.`;
};

export const toRestoreQuestion = (name: string): string => `${name} wieder aktivieren?`;

export const RESTORE_EYEBROW = 'Gruppe aktivieren';
export const RESTORE_EXPLANATION =
  'Die Gruppe erscheint wieder im Verzeichnis und zählt wieder für die Vereinsbindung.';

export const toRestoreConsequence = (
  name: string,
  memberCount: number,
  todayLabel: string,
): string =>
  `Ab dem ${todayLabel} ist ${name} wieder aktiv. ${toZugehoerigkeitenClause(memberCount, 'zählt wieder mit', 'zählen wieder mit')}`;

export const toGroupFacts = (group: ManagedGroupSummary, dayLabel: string): KkConfirmFact[] => [
  { label: 'Gruppe', value: group.name },
  { label: 'Personen', value: String(group.memberCount) },
  { label: 'Gruppen-Admins', value: String(group.admins.length) },
  { label: 'Ab', value: dayLabel },
];

export const toGroupCreatedMessage = (name: string): string => `${name} ist angelegt.`;

export const toGroupRestoredMessage = (name: string): string => `${name} ist wieder aktiv.`;

export const GROUP_KINDS_PANEL_TITLE = 'Gruppenarten';

export const GROUP_KIND_SECTION_TITLE = 'Gruppenart';

export const CREATE_GROUP_KIND_LABEL = 'Gruppenart hinzufügen';
export const CREATE_GROUP_KIND_PILL_LABEL = 'Gruppenart';

export const GROUP_KINDS_EMPTY_TITLE = 'NOCH KEINE GRUPPENART';

export const GROUP_KINDS_EMPTY_DESCRIPTION = 'Lege die erste Gruppenart an.';

export const toGroupKindLockedReason = (groupCount: number): string =>
  groupCount === 1
    ? 'Einer Gruppe ist diese Art zugeordnet. Ändere zuerst die Zuordnung.'
    : `${groupCount} Gruppen ist diese Art zugeordnet. Ändere zuerst die Zuordnung.`;

export interface GroupKindEntry {
  groupKindId: number;
  name: string;
  archivedOn: string | null;
  isArchived: boolean;
  groupCount: number;
}

const toGroupKindEntry = (kind: ManagedGroupKind): GroupKindEntry => ({
  groupKindId: kind.groupKindId,
  name: kind.name,
  archivedOn: kind.archivedOn,
  isArchived: kind.archivedOn !== null,
  groupCount: kind.groupCount,
});

const runningFirstThenByName = (left: GroupKindEntry, right: GroupKindEntry): number => {
  if (left.isArchived !== right.isArchived) {
    return left.isArchived ? 1 : -1;
  }

  return left.name.localeCompare(right.name, 'de');
};

export const toGroupKindEntries = (kinds: readonly ManagedGroupKind[]): GroupKindEntry[] =>
  kinds.map(toGroupKindEntry).sort(runningFirstThenByName);

export const findGroupKindEntry = (
  entries: readonly GroupKindEntry[],
  groupKindId: number | null,
): GroupKindEntry | null => {
  if (groupKindId === null) {
    return null;
  }

  return entries.find((entry) => entry.groupKindId === groupKindId) ?? null;
};

const GROUP_KIND_ROUTE = '/manage/groups/kinds/$groupKindId';

export const toGroupKindEditorOrigin = (entry: GroupKindEntry | null): KkScreenOrigin =>
  entry === null
    ? MANAGE_GROUPS_ORIGIN
    : {
        label: entry.name,
        to: GROUP_KIND_ROUTE,
        params: { groupKindId: String(entry.groupKindId) },
      };

export const isGroupKindArchivable = (entry: GroupKindEntry): boolean =>
  !entry.isArchived && entry.groupCount === 0;

export const toGroupKindUsageLine = (groupCount: number): string => {
  if (groupCount === 0) {
    return 'keine Gruppe';
  }
  if (groupCount === 1) {
    return '1 Gruppe';
  }

  return `${groupCount} Gruppen`;
};

export interface GroupKindUsageBadge {
  label: string;
  tone: KkChipTone;
  dot: boolean;
}

const UNUSED_KIND_LABEL = 'Ohne Gruppe';

export const toGroupKindUsageBadge = (entry: GroupKindEntry): GroupKindUsageBadge => {
  if (entry.archivedOn !== null) {
    return { label: toArchivedOnLabel(entry.archivedOn), tone: 'neutral', dot: false };
  }
  if (entry.groupCount === 0) {
    return { label: UNUSED_KIND_LABEL, tone: 'gold', dot: true };
  }

  return { label: toGroupKindUsageLine(entry.groupCount), tone: 'neutral', dot: false };
};

export const GROUP_KINDS_LEAD = 'Einordnung der Gruppen.';
export const toGroupKindFacts = (entry: GroupKindEntry, dayLabel: string): KkConfirmFact[] => [
  { label: 'Gruppenart', value: entry.name },
  { label: 'Gruppen', value: String(entry.groupCount) },
  { label: 'Ab', value: dayLabel },
];

export const ARCHIVE_GROUP_KIND_EYEBROW = 'Gruppenart archivieren';

export const toArchiveGroupKindQuestion = (name: string): string => `${name} archivieren?`;

export const ARCHIVE_GROUP_KIND_EXPLANATION =
  'Die Gruppenart lässt sich danach keiner Gruppe mehr zuordnen. Bestehende Zuordnungen bleiben erhalten.';

export const toArchiveGroupKindConsequence = (name: string, dayLabel: string): string =>
  `Ab dem ${dayLabel} steht ${name} nicht mehr zur Auswahl.`;

export const RESTORE_GROUP_KIND_EYEBROW = 'Gruppenart aktivieren';

export const toRestoreGroupKindQuestion = (name: string): string => `${name} wieder aktivieren?`;

export const RESTORE_GROUP_KIND_EXPLANATION =
  'Die Gruppenart lässt sich wieder zuordnen. Bestehende Zuordnungen bleiben unverändert.';

export const toRestoreGroupKindConsequence = (name: string, dayLabel: string): string =>
  `Ab dem ${dayLabel} steht ${name} wieder zur Auswahl.`;

export const toGroupKindCreatedMessage = (name: string): string =>
  `Die Gruppenart ${name} ist angelegt.`;

export const toGroupKindSavedMessage = (name: string): string =>
  `Die Angaben zu ${name} sind gespeichert.`;

export const toGroupKindArchivedMessage = (name: string): string => `${name} ist archiviert.`;

export const toGroupKindRestoredMessage = (name: string): string =>
  `${name} steht wieder zur Auswahl.`;
