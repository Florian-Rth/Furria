import type { PublicGroup } from '@/lib/public-groups/schemas';

export const groupsChapter = {
  numeral: '04',
  kicker: 'WER BEIM FCC AUFTRITT',
  title: 'UNSERE GRUPPEN',
} as const;

export const groupsLabels = {
  more: 'Mehr →',
  photo: 'gruppen-foto',
  close: 'Schließen',
  joinCta: 'Mitglied werden →',
  askCta: 'Schreib uns',
  loading: 'Die Gruppen kommen gleich.',
  errorTitle: 'DIE GRUPPEN KOMMEN NICHT DURCH.',
  errorText:
    'Das liegt an uns, nicht an dir. Versuch es gleich noch einmal — oder schreib uns, dann antwortet ein Mensch.',
  errorRetry: 'Nochmal versuchen',
  emptyTitle: 'HIER STEHT GLEICH MEHR.',
  emptyText:
    'Gerade ist keine Gruppe eingetragen. Das heißt nicht, dass nichts los ist — schreib uns, dann erzählen wir dir, was diese Session läuft.',
  noDescription:
    'Zu dieser Gruppe steht hier noch nichts. Frag uns einfach, dann erzählen wir dir mehr.',
} as const;

export const formatGroupCount = (total: number): string =>
  total === 1 ? 'eine Gruppe' : `${total} Gruppen`;

export const buildGroupsIntro = (total: number): string => `Aktuell ${formatGroupCount(total)}.`;

export const buildGroupOpenLabel = (groupName: string): string => `${groupName} — mehr erfahren`;

export const buildGroupBadge = (index: number): string => String(index + 1).padStart(2, '0');

export const OTHER_GROUPS_TITLE = 'Weitere Gruppen';

export interface GroupKindSection {
  kindName: string | null;
  groups: PublicGroup[];
}

const byKindName = (left: GroupKindSection, right: GroupKindSection): number => {
  if (left.kindName === null || right.kindName === null) {
    return left.kindName === null ? 1 : -1;
  }

  return left.kindName.localeCompare(right.kindName, 'de');
};

export const groupByKind = (groups: PublicGroup[]): GroupKindSection[] => {
  const sections = new Map<string | null, PublicGroup[]>();

  for (const group of groups) {
    sections.set(group.groupKindName, [...(sections.get(group.groupKindName) ?? []), group]);
  }

  return [...sections]
    .map(([kindName, members]) => ({ kindName, groups: members }))
    .sort(byKindName);
};

export const resolveSectionTitle = (
  kindName: string | null,
  sectionCount: number,
): string | null => {
  if (kindName !== null) {
    return kindName;
  }

  return sectionCount > 1 ? OTHER_GROUPS_TITLE : null;
};

export const buildFoundedLabel = (foundedYear: number | null): string | null =>
  foundedYear === null ? null : `Seit ${foundedYear}`;
