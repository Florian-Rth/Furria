import { KK_TONE_PATTERN } from '@furria/ui/group-tone';
import { z } from 'zod';

export const GroupToneSchema = z
  .string()
  .regex(KK_TONE_PATTERN)
  .transform((tone) => tone.toUpperCase());
export type GroupTone = z.infer<typeof GroupToneSchema>;

const PRESET_LABELS: ReadonlyMap<string, string> = new Map([
  ['#A0522B', 'Ton'],
  ['#676C1D', 'Oliv'],
  ['#43741F', 'Limette'],
  ['#207823', 'Farn'],
  ['#1F7565', 'Petrol'],
  ['#3F5FCC', 'Indigo'],
  ['#6E50D1', 'Iris'],
  ['#9C35C8', 'Violett'],
  ['#B12F9C', 'Orchidee'],
  ['#BA3264', 'Rosé'],
]);

export const CUSTOM_TONE_LABEL = 'Eigene Farbe';

export const toToneLabel = (tone: GroupTone): string =>
  PRESET_LABELS.get(tone.toUpperCase()) ?? CUSTOM_TONE_LABEL;

export const TONE_PICKER_COPY = {
  custom: CUSTOM_TONE_LABEL,
  area: 'Sättigung und Helligkeit',
  hue: 'Farbton',
  hex: 'Farbcode',
  hexInvalid: 'Farbcode im Format #RRGGBB eingeben.',
  takenSuffix: ' — schon vergeben',
} as const;
