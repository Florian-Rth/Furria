import type { Theme } from '@mui/material/styles';
import type { PublicBoardSeat } from './schemas';

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
  tint: string;
}

export const resolvePersonTint = (theme: Theme, index: number): string => {
  const palette = (theme.vars ?? theme).palette;
  const tints = [palette.primary.main, palette.warning.main, palette.text.primary];
  return tints[index % tints.length] ?? palette.primary.main;
};

const initialOf = (name: string): string => name.trim().charAt(0).toLocaleUpperCase('de-DE');

export const toInitials = (firstName: string, lastName: string): string =>
  `${initialOf(firstName)}${initialOf(lastName)}`;

export const toBoardTiles = (seats: PublicBoardSeat[], theme: Theme): BoardTile[] =>
  seats.map((seat, index) => ({
    key: `${seat.officeName}-${seat.firstName}-${seat.lastName}`,
    officeName: seat.officeName,
    name: `${seat.firstName} ${seat.lastName}`,
    initials: toInitials(seat.firstName, seat.lastName),
    portraitUrl: seat.portraitUrl ?? undefined,
    tint: resolvePersonTint(theme, index),
  }));
