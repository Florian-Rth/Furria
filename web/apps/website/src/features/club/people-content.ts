import type { Theme } from '@mui/material/styles';
import { PORTRAIT_ASPECT, toPictureSources } from '@/lib/api/picture';
import type { PublicBoardSeat } from './schemas';
import { resolveCycleTint } from './tint-cycle';

export const peopleChapter = {
  numeral: '05',
  kicker: 'WER FURRIA ZUSAMMENHÄLT',
  title: 'MENSCHEN, DIE FURRIA SIND',
} as const;

export interface BoardTile {
  key: string;
  officeName: string;
  name: string;
  initials: string;
  portraitUrl: string | undefined;
  portraitSourceSet: string | undefined;
  tint: string;
}

const initialOf = (name: string): string => name.trim().charAt(0).toLocaleUpperCase('de-DE');

export const toInitials = (firstName: string, lastName: string): string =>
  `${initialOf(firstName)}${initialOf(lastName)}`;

export const toBoardTiles = (seats: PublicBoardSeat[], theme: Theme): BoardTile[] =>
  seats.map((seat, index) => {
    const portrait = toPictureSources(seat.portrait, PORTRAIT_ASPECT);

    return {
      key: `${seat.officeName}-${seat.firstName}-${seat.lastName}`,
      officeName: seat.officeName,
      name: `${seat.firstName} ${seat.lastName}`,
      initials: toInitials(seat.firstName, seat.lastName),
      portraitUrl: portrait.source,
      portraitSourceSet: portrait.sourceSet,
      tint: resolveCycleTint(theme, index),
    };
  });
