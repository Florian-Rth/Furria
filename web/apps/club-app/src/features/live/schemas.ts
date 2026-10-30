import { z } from 'zod';
import { ActGroupSchema, ActKindSchema } from '@/features/running-order/schemas';
import { PortraitPersonRefSchema } from '@/lib/api/schemas';

export const LivePersonSchema = PortraitPersonRefSchema.extend({
  absent: z.boolean(),
  standsIn: z.boolean(),
});
export type LivePerson = z.infer<typeof LivePersonSchema>;

export const LiveLineSchema = z.object({
  appearanceId: z.number().int(),
  actId: z.number().int(),
  name: z.string(),
  kind: ActKindSchema.nullable(),
  group: ActGroupSchema.nullable(),
  position: z.number().int(),
  own: z.boolean(),
  cast: z.array(LivePersonSchema),
  missing: z.array(LivePersonSchema),
});
export type LiveLine = z.infer<typeof LiveLineSchema>;

export const LiveDirectionSchema = z.object({
  appearanceId: z.number().int().nullable(),
  startedAt: z.string(),
  movedAt: z.string(),
});
export type LiveDirection = z.infer<typeof LiveDirectionSchema>;

export const EveningLiveResponseSchema = z.object({
  calendarEntryId: z.number().int(),
  title: z.string(),
  startsAt: z.string(),
  canDirect: z.boolean(),
  live: LiveDirectionSchema.nullable(),
  lines: z.array(LiveLineSchema),
});
export type EveningLiveResponse = z.infer<typeof EveningLiveResponseSchema>;

export const LiveMoveBodySchema = z.object({
  from: z.number().int().nullable(),
  to: z.number().int().nullable(),
});
export type LiveMoveBody = z.infer<typeof LiveMoveBodySchema>;
