import { z } from 'zod';
import {
  ActGroupSchema,
  ActKindSchema,
  CastPersonSchema,
  EveningChangeSchema,
} from '@/features/running-order/schemas';

export const READINESS_CHECKS = [
  'music',
  'steps',
  'formation',
  'videos',
  'finalFile',
  'cast',
] as const;
export const ReadinessCheckSchema = z.enum(READINESS_CHECKS);
export type ReadinessCheck = z.infer<typeof ReadinessCheckSchema>;

export const SeasonReadinessSchema = z.object({
  check: ReadinessCheckSchema,
  done: z.boolean(),
});
export type SeasonReadiness = z.infer<typeof SeasonReadinessSchema>;

export const SeasonEveningSchema = z.object({
  eventId: z.number().int(),
  title: z.string(),
  startsAt: z.string(),
  hasRunningOrder: z.boolean(),
  confirmed: z.boolean(),
});
export type SeasonEvening = z.infer<typeof SeasonEveningSchema>;

export const SeasonAppearanceSchema = z.object({
  appearanceId: z.number().int(),
  eventId: z.number().int(),
  position: z.number().int().nullable(),
  changes: z.array(EveningChangeSchema),
  added: z.array(CastPersonSchema),
  removed: z.array(CastPersonSchema),
});
export type SeasonAppearance = z.infer<typeof SeasonAppearanceSchema>;

export const SeasonActSchema = z.object({
  actId: z.number().int(),
  name: z.string(),
  kind: ActKindSchema.nullable(),
  group: ActGroupSchema.nullable(),
  castCount: z.number().int(),
  readiness: z.array(SeasonReadinessSchema),
  appearances: z.array(SeasonAppearanceSchema),
});
export type SeasonAct = z.infer<typeof SeasonActSchema>;

export const ActSeasonResponseSchema = z.object({
  sessionYear: z.number().int(),
  sessionYears: z.array(z.number().int()),
  evenings: z.array(SeasonEveningSchema),
  acts: z.array(SeasonActSchema),
});
export type ActSeasonResponse = z.infer<typeof ActSeasonResponseSchema>;
