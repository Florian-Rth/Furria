import { currentSession, FOUNDING_YEAR } from '@/lib/club';

export const buildClubHeroRibbon = (foundingYear: number): string =>
  `SEIT ${foundingYear} · GROSSBESENSTADT`;

export const clubHeroRibbon = buildClubHeroRibbon(FOUNDING_YEAR);
export const clubHeroNumeral: number = currentSession.number;

export const clubHeroHeadline = {
  line1: 'WIR NEHMEN SPASS',
  line2: 'SEHR ERNST.',
} as const;

export const clubHeroIntro =
  'Der Furrsche Carnevals Club e.V. ist der Ort, an dem die fünfte Jahreszeit lebt: ein Verein, der Bühne, Tradition und Freundschaft über Generationen zusammenhält — und jede Session aufs Neue feiert.';

export const clubHeroPrimaryCtaLabel = 'Mitglied werden →';
export const clubHeroSecondaryCtaLabel = 'Zum Programm';
export const clubHeroPhotoCaption = 'session-buehne';
