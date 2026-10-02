import { formatMemberCount, UNKNOWN_FACT } from '@/lib/public-club/club-facts';
import type { PublicClub } from '@/lib/public-club/schemas';

export interface JoinStat {
  value: string;
  label: string;
}

const MEMBERS_LABEL = 'Mitglieder';
const GROUPS_LABEL = 'Garden & Gruppen';

export const buildJoinStats = (club: PublicClub | undefined): JoinStat[] => [
  {
    value: club === undefined ? UNKNOWN_FACT : formatMemberCount(club.memberCount),
    label: MEMBERS_LABEL,
  },
  { value: club === undefined ? UNKNOWN_FACT : String(club.groupCount), label: GROUPS_LABEL },
];

export const joinEyebrow = 'DU MÖCHTEST MITMACHEN?';

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
