import { GROUP_TONES } from '@furria/ui/group-tone';
import { z } from 'zod';

export const GroupToneSchema = z.enum(GROUP_TONES);
export type GroupTone = z.infer<typeof GroupToneSchema>;
