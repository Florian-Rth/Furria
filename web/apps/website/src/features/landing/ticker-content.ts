import type { PublicClubSession } from '@/lib/public-club/schemas';

export const TICKER_REPEAT_COUNT = 8;

export interface TickerItem {
  key: string;
  phrase: string;
}

const CLUB_PHRASES = ['GROSS FURRIA', 'GROSSFURRA'];

const sessionPhrasesOf = (session: PublicClubSession): string[] =>
  session.motto === null
    ? [`SESSION ${session.label}`]
    : [`SESSION ${session.label}`, session.motto.toLocaleUpperCase('de-DE')];

export const buildTickerPhrases = (session: PublicClubSession | undefined): string[] =>
  session === undefined ? CLUB_PHRASES : [...CLUB_PHRASES, ...sessionPhrasesOf(session)];

export const repeatTickerPhrases = (phrases: string[]): TickerItem[] =>
  Array.from({ length: TICKER_REPEAT_COUNT }, (_, repeat) => repeat).flatMap((repeat) =>
    phrases.map((phrase) => ({ key: `${repeat}-${phrase}`, phrase })),
  );
