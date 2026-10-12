import type { KkImageSource } from '@furria/ui';
import { toImageSource } from '@furria/ui';
import type { Theme } from '@mui/material/styles';
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
  portrait: KkImageSource | null;
  tint: string;
}

const PORTRAIT_SIZES = '(min-width: 900px) 18rem, 50vw';

const initialOf = (name: string): string => name.trim().charAt(0).toLocaleUpperCase('de-DE');

export const toInitials = (firstName: string, lastName: string): string =>
  `${initialOf(firstName)}${initialOf(lastName)}`;

export const toBoardTiles = (seats: PublicBoardSeat[], theme: Theme): BoardTile[] =>
  seats.map((seat, index) => ({
    key: `${seat.officeName}-${seat.firstName}-${seat.lastName}`,
    officeName: seat.officeName,
    name: `${seat.firstName} ${seat.lastName}`,
    initials: toInitials(seat.firstName, seat.lastName),
    portrait: toImageSource(seat.portrait, 'portrait', PORTRAIT_SIZES),
    tint: resolveCycleTint(theme, index),
  }));
