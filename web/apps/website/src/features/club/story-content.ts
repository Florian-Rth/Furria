import { formatMemberCount, UNKNOWN_FACT } from '@/lib/public-club/club-facts';
import type { PublicClub } from '@/lib/public-club/schemas';

export const storyChapter = {
  numeral: '01',
  kicker: 'WER WIR SIND',
  title: 'EINE IDEE, DIE BLIEB',
} as const;

export const storyPullQuote = '„Das müßte doch zu machen sein!“';

export const storyPullQuoteSource = 'Dieter Röhl, Aschermittwoch 1971';

export const storyLead =
  'Aus der Idee von damals ist heute der Verein geworden, der in Großfurra die fünfte Jahreszeit macht – für Kinder, Jugendliche, Eltern und Großeltern, auf der Bühne und davor.';

export const storyBody =
  'Bei uns hat jeder seinen Platz: Die einen tanzen, die anderen reimen in der Bütt, wieder andere malen Kulissen, nähen Kostüme oder stehen hinter dem Tresen. Manche machen alles davon – meist ohne es vorher geplant zu haben. Und wenn die Session vorbei ist, sieht man sich trotzdem: beim Sommerfest, bei der Herbstwanderung und auf dem Hofweihnachtsmarkt.';

export interface StoryStat {
  value: string;
  label: string;
}

const FOUNDED_LABEL = 'gegründet';
const MEMBERS_LABEL = 'Mitglieder';
const GROUPS_LABEL = 'Gruppen';

const pendingStoryStats: StoryStat[] = [
  { value: UNKNOWN_FACT, label: FOUNDED_LABEL },
  { value: UNKNOWN_FACT, label: MEMBERS_LABEL },
  { value: UNKNOWN_FACT, label: GROUPS_LABEL },
];

const countStatsOf = (club: PublicClub): StoryStat[] => [
  { value: formatMemberCount(club.memberCount), label: MEMBERS_LABEL },
  { value: String(club.groupCount), label: GROUPS_LABEL },
];

export const buildStoryStats = (club: PublicClub | undefined): StoryStat[] => {
  if (club === undefined) {
    return pendingStoryStats;
  }

  return club.foundedYear === null
    ? countStatsOf(club)
    : [{ value: String(club.foundedYear), label: FOUNDED_LABEL }, ...countStatsOf(club)];
};
