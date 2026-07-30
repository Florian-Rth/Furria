import type { Session } from '@/lib/club';
import { currentSession, GROUP_COUNT_PLACEHOLDER, MEMBER_COUNT_PLACEHOLDER } from '@/lib/club';

export interface JoinStat {
  value: string;
  label: string;
}

export const buildJoinEyebrow = (yearsLabel: string): string =>
  `MITGLIED WERDEN · SESSION ${yearsLabel}`;

export const buildJoinStats = (
  memberCount: string,
  groupCount: number,
  session: Session,
): JoinStat[] => [
  { value: memberCount, label: 'Mitglieder' },
  { value: String(groupCount), label: 'Garden & Gruppen' },
  { value: `${session.number}.`, label: 'Session' },
];

export const joinEyebrow: string = buildJoinEyebrow(currentSession.yearsLabel);

export const joinStats: JoinStat[] = buildJoinStats(
  MEMBER_COUNT_PLACEHOLDER,
  GROUP_COUNT_PLACEHOLDER,
  currentSession,
);

export const joinPageTitle = 'DU MUSST NICHT TANZEN KÖNNEN.';

export const joinDescription =
  'Was Menschen vom Verein fernhält, ist selten der Beitrag. Es ist der Gedanke, hier seien alle seit der Grundschule im Takt — und man selbst guckt beim ersten Aufstellen in die falsche Richtung. Passiert. Jede Session. Geblieben sind sie trotzdem alle.';

export const joinHref = '/join';
export const joinApplyHref = '/join/apply';
export const joinPrimaryCtaLabel = 'Antrag stellen →';

export const kompassSectionId = 'konfetti-kompass';
export const kompassSectionHref = `#${kompassSectionId}`;
export const joinSecondaryCtaLabel = 'Wo passe ich hin? ↓';

export const joinHeroPhotoCaption = 'erste-session';
