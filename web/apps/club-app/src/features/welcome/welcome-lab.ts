import type { WelcomeMember } from './welcome-plan';

export interface WelcomeLabCase {
  slug: string;
  title: string;
  member: WelcomeMember;
}

export const WELCOME_LAB_TITLE = 'Willkommen beim ersten Anmelden';

export const WELCOME_LAB_CASES: readonly WelcomeLabCase[] = [
  {
    slug: 'mitglied-mit-aemtern',
    title: 'Mitglied mit Ämtern',
    member: {
      firstName: 'Lena',
      memberSince: '2015-09-01',
      sessionOrdinal: 12,
      functions: [
        { kind: 'role', name: 'Trainerin', icon: null, tone: null },
        { kind: 'boardSeat', name: 'Kassenprüferin', icon: null, tone: null },
      ],
    },
  },
  {
    slug: 'erste-session',
    title: 'Vor der ersten Session',
    member: { firstName: 'Jana', memberSince: '2026-09-01', sessionOrdinal: 1, functions: [] },
  },
  {
    slug: 'gruendungsmitglied',
    title: 'Gründungsmitglied',
    member: {
      firstName: 'Gerd',
      memberSince: '1971-11-11',
      sessionOrdinal: 56,
      functions: [{ kind: 'role', name: 'Ehrenpräsident', icon: null, tone: null }],
    },
  },
  {
    slug: 'ohne-mitgliedschaft',
    title: 'Ohne Mitgliedschaft',
    member: { firstName: 'Kevin', memberSince: null, sessionOrdinal: null, functions: [] },
  },
  {
    slug: 'langer-vorname',
    title: 'Langer Vorname',
    member: {
      firstName: 'Maximiliane-Sophie',
      memberSince: '2003-01-15',
      sessionOrdinal: 24,
      functions: [{ kind: 'groupAdmin', name: 'Tanzgarde', icon: null, tone: null }],
    },
  },
];

export const welcomeLabPathOf = (labCase: WelcomeLabCase): string => `/lab/welcome/${labCase.slug}`;

export const welcomeLabCaseOf = (slug: string): WelcomeLabCase | null =>
  WELCOME_LAB_CASES.find((labCase) => labCase.slug === slug) ?? null;
