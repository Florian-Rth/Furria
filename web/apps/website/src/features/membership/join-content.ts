import type { Session } from '@/lib/club';
import { currentSession, GROUP_COUNT_PLACEHOLDER, MEMBER_COUNT_PLACEHOLDER } from '@/lib/club';

export interface JoinStat {
  value: string;
  label: string;
}

export const buildJoinStats = (
  memberCount: string,
  groupCount: number,
  session: Session,
): JoinStat[] => [
  { value: memberCount, label: 'Mitglieder' },
  { value: String(groupCount), label: 'Garden & Gruppen' },
  { value: `${session.number}.`, label: 'Session' },
];

export const joinEyebrow = 'DU MÖCHTEST MITMACHEN?';

export const joinStats: JoinStat[] = buildJoinStats(
  MEMBER_COUNT_PLACEHOLDER,
  GROUP_COUNT_PLACEHOLDER,
  currentSession,
);

export const joinPageTitle = 'MITGLIED WERDEN';

export const joinDescription =
  'Auf dieser Seite steht alles, was du für den Schritt in den Verein brauchst: was eine Mitgliedschaft kostet, was du dafür bekommst, wie der Antrag abläuft — und welche Gruppe zu dir passt. Vorkenntnisse im Tanzen, Reimen oder Kassenführen sind ausdrücklich keine Bedingung.';

export const joinHref = '/join';
export const joinApplyHref = '/join/apply';
export const joinPrimaryCtaLabel = 'Antrag stellen →';

export const matcherSectionId = 'group-matcher';
export const matcherSectionHref = `#${matcherSectionId}`;
export const joinSecondaryCtaLabel = 'Wo passe ich hin? ↓';

export const joinHeroPhotoCaption = 'erste-session';
