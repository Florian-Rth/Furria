import type { KkClubIcon } from '@furria/ui/club-icon';
import { KK_CLUB_ICONS } from '@furria/ui/club-icon';
import { z } from 'zod';

export const ClubIconSchema = z.enum(KK_CLUB_ICONS);
export type ClubIcon = z.infer<typeof ClubIconSchema>;

export const CLUB_ICON_FIELD_LABEL = 'Symbol';
export const NO_CLUB_ICON_LABEL = 'Kein Symbol';

const CLUB_ICON_LABELS: Record<KkClubIcon, string> = {
  crown: 'Krone',
  euro: 'Euro',
  bolt: 'Blitz',
  shield: 'Schild',
  camera: 'Kamera',
  sparkle: 'Funkeln',
  mic: 'Mikrofon',
  musicNote: 'Note',
  drum: 'Trommel',
  mask: 'Maske',
  megaphone: 'Megafon',
  star: 'Stern',
  trophy: 'Pokal',
  flag: 'Fahne',
  key: 'Schlüssel',
  shirt: 'Kostüm',
  pen: 'Stift',
  wrench: 'Werkzeug',
  palette: 'Palette',
  heart: 'Herz',
  mug: 'Krug',
  calendar: 'Kalender',
  whistle: 'Pfeife',
  broom: 'Besen',
};

export const toClubIconLabel = (icon: KkClubIcon): string => CLUB_ICON_LABELS[icon];
