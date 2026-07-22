import { currentSession, SESSION_OPENING_DAY, SESSION_OPENING_MONTH } from '@/lib/club';

export interface HeroStat {
  value: string;
  label: string;
}

export const buildEyebrowLabel = (yearsLabel: string, day: number, month: number): string =>
  `★ SESSION ${yearsLabel} · ${day}.${month}. ERÖFFNUNG`;

export const eyebrowLabel = buildEyebrowLabel(
  currentSession.yearsLabel,
  SESSION_OPENING_DAY,
  SESSION_OPENING_MONTH,
);

export const buildHeroStats = (
  memberCount: string,
  groupCount: number,
  foundingYear: number,
): HeroStat[] => [
  { value: memberCount, label: 'Mitglieder' },
  { value: String(groupCount), label: 'Garden & Gruppen' },
  { value: String(foundingYear), label: 'gegründet' },
];
