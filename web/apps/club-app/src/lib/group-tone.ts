import { GROUP_TONES } from '@furria/ui/group-tone';
import { z } from 'zod';

export const GroupToneSchema = z.enum(GROUP_TONES);
export type GroupTone = z.infer<typeof GroupToneSchema>;

const TONE_LABELS: Record<GroupTone, string> = {
  clay: 'Ton',
  olive: 'Oliv',
  lime: 'Limette',
  fern: 'Farn',
  teal: 'Petrol',
  indigo: 'Indigo',
  iris: 'Iris',
  violet: 'Violett',
  orchid: 'Orchidee',
  rose: 'Rosé',
};

export const toToneLabel = (tone: GroupTone): string => TONE_LABELS[tone];
