import type { KkChipTone } from '@furria/ui';
import type { Theme } from '@mui/material/styles';
import { CLUB_CONTACT_EMAIL } from '@/lib/club';
import type { PublicGroup } from './schemas';

export const groupsChapter = {
  numeral: '04',
  kicker: 'WER BEI FURRIA AUFTRITT',
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

export const groupsMailHref = `mailto:${CLUB_CONTACT_EMAIL}`;

export interface GroupOpenness {
  label: string;
  note: string;
  tone: KkChipTone;
  dot: boolean;
}

const RECRUITING_OPENNESS: GroupOpenness = {
  label: 'sucht Verstärkung',
  note: 'Diese Gruppe nimmt gerade neue Leute auf — meld dich, dann verabreden wir einen ersten Termin.',
  tone: 'gold',
  dot: true,
};

const SETTLED_OPENNESS: GroupOpenness = {
  label: 'sucht gerade niemanden',
  note: 'Frag trotzdem nach — was eine Gruppe braucht, ändert sich jede Session.',
  tone: 'neutral',
  dot: false,
};

export const resolveGroupOpenness = (isRecruiting: boolean): GroupOpenness =>
  isRecruiting ? RECRUITING_OPENNESS : SETTLED_OPENNESS;

export const countRecruitingGroups = (groups: PublicGroup[]): number =>
  groups.filter((group) => group.isRecruiting).length;

export type GroupsIntroKind = 'none' | 'sole' | 'all' | 'some';

export const resolveGroupsIntroKind = (total: number, recruiting: number): GroupsIntroKind => {
  if (recruiting === 0) {
    return 'none';
  }

  if (total === 1) {
    return 'sole';
  }

  return recruiting >= total ? 'all' : 'some';
};

export const formatGroupCount = (total: number): string =>
  total === 1 ? 'eine Gruppe' : `${total} Gruppen`;

export const formatRecruitingCount = (recruiting: number): string =>
  recruiting === 1 ? 'Eine davon sucht' : `${recruiting} davon suchen`;

const introTails: Record<GroupsIntroKind, (recruiting: number) => string> = {
  none: () => 'Gerade sucht keine davon aktiv Verstärkung — fragen kannst du trotzdem jederzeit.',
  sole: () => 'Sie sucht gerade Verstärkung.',
  all: () => 'Alle suchen gerade Verstärkung.',
  some: (recruiting) => `${formatRecruitingCount(recruiting)} gerade Verstärkung.`,
};

export const buildGroupsIntro = (total: number, recruiting: number): string => {
  const tail = introTails[resolveGroupsIntroKind(total, recruiting)](recruiting);

  return `Aktuell ${formatGroupCount(total)}. ${tail}`;
};

export const buildGroupOpenLabel = (groupName: string): string => `${groupName} — mehr erfahren`;

export const resolveGroupTint = (theme: Theme, index: number): string => {
  const palette = (theme.vars ?? theme).palette;
  const tints = [palette.primary.main, palette.warning.main, palette.text.primary];
  return tints[index % tints.length] ?? palette.primary.main;
};

export const buildGroupBadge = (index: number): string => String(index + 1).padStart(2, '0');
